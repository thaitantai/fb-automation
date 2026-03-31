import { Job } from 'bullmq';
import { Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { prisma } from '@fb-automation/database';
import { browserDriver } from '../../drivers/browser';
import { applyFullProtection } from '@fb-automation/utils';
import { JobDefinition } from '../types';
import { verifyLoginStatus } from '../../utils/fb-auth';
import { FB_SELECTORS } from '@fb-automation/constants';
import { captureErrorScreenshot } from '../../utils/screenshot';

/**
 * Lớp điều khiển luồng đăng bài tự động (Clean Architecture - MASTER FIXED)
 */
class GroupPostExecutor {
    private page!: Page;
    private jobId: string;
    private localMediaPaths: string[] = [];

    constructor(jobId: string) {
        this.jobId = jobId;
    }

    async prepare(accountId: string, templateId: string, groupDbId: string, campaignId: string) {
        const [account, template, group, campaign] = await Promise.all([
            prisma.fbAccount.findUnique({ where: { id: accountId } }),
            prisma.postTemplate.findUnique({ where: { id: templateId } }),
            prisma.fbGroup.findUnique({ where: { id: groupDbId } }),
            prisma.campaign.findUnique({ where: { id: campaignId } })
        ]);

        if (!account) throw new Error('Không tìm thấy tài khoản Facebook.');
        if (!template) throw new Error('Mẫu bài đăng không tồn tại.');
        if (!group) throw new Error('Không tìm thấy thông tin nhóm.');
        if (!campaign) throw new Error('Không tìm thấy chiến dịch.');

        if (account.status !== 'ACTIVE') throw new Error(`[EarlyStop] Tài khoản đang ở trạng thái [${account.status}].`);

        return { account, template, group, campaign };
    }

    async applyContentProtection(content: string, protectionConfig: any) {
        return applyFullProtection(content, protectionConfig, process.env.GEMINI_API_KEY);
    }

    /**
     * TỐI ƯU MASTER: Chụp ảnh về đĩa (Không cần Browser)
     */
    async downloadMedia(mediaLinks: any) {
        if (!mediaLinks) return [];
        let urls = Array.isArray(mediaLinks) ? mediaLinks : JSON.parse(mediaLinks as string);
        if (urls.length === 0) return [];

        const tmpDir = path.join(process.cwd(), 'tmp', 'media');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const paths: string[] = [];
        await Promise.all(urls.map(async (url: string, i: number) => {
            try {
                const response = await fetch(url);
                const buffer = await response.arrayBuffer();
                const fileName = `job_${this.jobId}_img_${i}_${Date.now()}${path.extname(url) || '.jpg'}`;
                const filePath = path.join(tmpDir, fileName);
                fs.writeFileSync(filePath, Buffer.from(buffer));
                paths.push(filePath);
            } catch (err) { }
        }));
        this.localMediaPaths = paths;
        return paths;
    }

    async setupBrowserContext(context: any) {
        await context.route('**/*', (route: any, request: any) => {
            const type = request.resourceType();
            const url = request.url();
            if (['font', 'other'].includes(type) || 
                url.includes('google-analytics') || 
                url.includes('facebook.com/tr/') ||
                url.includes('connect.facebook.net')) {
                return route.abort();
            }
            return route.continue();
        });
    }

    async navigateToGroup(url: string, waitTime: number = 2000) {
        console.log(`[Job:${this.jobId}] 🚀 Đang vào nhóm: ${url}`);
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const scrollDist = Math.floor(Math.random() * 500) + 300;
        await this.page.evaluate((dist) => window.scrollBy(0, dist), scrollDist);
        await this.page.waitForTimeout(waitTime + Math.random() * 2000);
    }

    async openPostComposer() {
        const triggers = FB_SELECTORS.POST.COMPOSER_TRIGGERS;
        if (await this.page.locator(FB_SELECTORS.STATUS.NOT_JOINED).isVisible({ timeout: 5000 })) {
            throw new Error('[SmartError] CHƯA THAM GIA nhóm.');
        }
        for (const sel of triggers) {
            if (await this.page.locator(sel).isVisible({ timeout: 3000 })) {
                await this.page.click(sel);
                return true;
            }
        }
        return false;
    }

    /**
     * Chỉ thực hiện nạp file vào UI trình duyệt
     */
    async uploadMediaToBrowser() {
        if (this.localMediaPaths.length === 0) return;

        try {
            console.log(`[Job:${this.jobId}] 🖼️ Đang nạp media vào trình duyệt...`);
            const fileInputSelector = FB_SELECTORS.POST.FILE_INPUT;
            if (await this.page.locator(fileInputSelector).count() > 0) {
                await this.page.setInputFiles(fileInputSelector, this.localMediaPaths);
            } else {
                const [fileChooser] = await Promise.all([
                    this.page.waitForEvent('filechooser', { timeout: 10000 }),
                    this.page.click(FB_SELECTORS.POST.PHOTO_VIDEO_BUTTON)
                ]);
                await fileChooser.setFiles(this.localMediaPaths);
            }
            await this.page.waitForSelector(FB_SELECTORS.POST.UPLOAD_COMPLETE_INDICATOR, { timeout: 10000 }).catch(() => {});
        } catch (error: any) {
            console.warn(`[Job:${this.jobId}] ⚠️ Lỗi nạp ảnh: ${error.message}`);
        }
    }

    async typeMessage(content: string) {
        const textBoxSelector = FB_SELECTORS.POST.TEXTBOX;
        await this.page.waitForSelector(textBoxSelector, { timeout: 15000 });
        const messageBox = this.page.locator(textBoxSelector).first();
        await messageBox.click({ force: true });
        console.log(`[Job:${this.jobId}] ⌨️ Đang soạn bài...`);
        await this.page.keyboard.type(content, { delay: Math.floor(Math.random() * 80) + 40 });
        await this.page.waitForTimeout(2000);
    }

    async submitPost() {
        const postButtonSelectors = FB_SELECTORS.POST.SUBMIT_BUTTONS;
        for (const sel of postButtonSelectors) {
            try {
                const btn = this.page.locator(sel);
                if (await btn.isVisible() && await btn.isEnabled()) {
                    await btn.click({ force: true });
                    return true;
                }
            } catch (e) { }
        }
        return false;
    }

    async analyzeExecutionStatus() {
        await this.page.waitForTimeout(3000);
        if (await this.page.locator(FB_SELECTORS.STATUS.BLOCKED).isVisible({ timeout: 2000 })) {
            return { status: 'ERROR', message: 'Tài khoản bị CHẶN đăng bài.' };
        }
        if (await this.page.locator(FB_SELECTORS.STATUS.PENDING_APPROVAL).isVisible({ timeout: 2000 })) {
            return { status: 'SUCCESS', message: 'Đăng thành công (Chờ duyệt).' };
        }
        return null;
    }

    async logResult(campaignId: string, accountId: string, status: 'SUCCESS' | 'ERROR', message: string, batchId?: string, screenshotUrl?: string) {
        await prisma.jobLog.create({
            data: {
                campaignId, fbAccountId: accountId, batchId: batchId || null,
                actionType: status === 'SUCCESS' ? 'AUTO_POST' : 'AUTO_POST_ERROR',
                message, screenshotUrl, executedAt: new Date()
            } as any
        });
    }

    async checkCompletion(campaignId: string, currentBatchId: string) {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { fbAccounts: { select: { id: true } } }
        });
        if (!campaign) return;
        const targetGroupIds = (campaign.targetConfigs as any)?.groupIds || [];
        const totalTargets = campaign.fbAccounts.length * targetGroupIds.length;
        const currentBatchLogs = await prisma.jobLog.findMany({ where: { campaignId, batchId: currentBatchId } });
        if (currentBatchLogs.length >= totalTargets) {
            const hasSuccess = currentBatchLogs.some(log => log.actionType === 'AUTO_POST');
            await prisma.campaign.update({ where: { id: campaignId }, data: { status: hasSuccess ? 'COMPLETED' : 'FAILED' } as any });
        }
    }

    async execute(job: Job) {
        const { campaignId, accountId, groupId, templateId, batchId } = job.data;
        let browser: any = null;
        let errorScreenPath: string | undefined;

        try {
            console.log(`[Job:${this.jobId}] 🔥 Khởi động cổ máy Master Optimized...`);
            
            const [data, launchResult] = await Promise.all([
                this.prepare(accountId, templateId, groupId, campaignId),
                browserDriver.launch({ headless: false, desktop: true })
            ]);

            const { account, template, group, campaign } = data;
            const protection = (campaign as any).protectionConfig || {};

            // EAGER LOADING: Tải ảnh và Gọi AI TRƯỚC KHI mở trang web
            const [protectedContent, _paths] = await Promise.all([
                this.applyContentProtection(template.contentSpintax, protection),
                this.downloadMedia(template.mediaUrls) 
            ]);

            browser = launchResult.browser;
            const context = launchResult.context;
            await this.setupBrowserContext(context);
            this.page = await context.newPage();
            await context.addCookies(JSON.parse(account.sessionData!));

            // NAVIGATION
            await this.navigateToGroup(`https://facebook.com/groups/${group.groupId}`);

            if (!await verifyLoginStatus(this.page, accountId, this.jobId)) {
                throw new Error('[SmartError] Cookies hết hạn hoặc checkpoint.');
            }

            if (!await this.openPostComposer()) throw new Error('[SmartError] Không mở được ô soạn bài.');

            // Thực thi tuần tự trên Browser
            await this.uploadMediaToBrowser();
            await this.typeMessage(protectedContent);

            if (!await this.submitPost()) throw new Error('[SmartError] Nút đăng bị lỗi.');

            const smartStatus = await this.analyzeExecutionStatus();
            if (smartStatus?.status === 'ERROR') throw new Error(smartStatus.message);

            await this.logResult(campaignId, accountId, 'SUCCESS', smartStatus?.message || `Đăng thành công lên: ${group?.name || groupId}`, batchId);
            await this.page.waitForTimeout(3000);

        } catch (error: any) {
            console.error(`[Job:${this.jobId}] 🔴 Lỗi: ${error.message}`);
            errorScreenPath = await captureErrorScreenshot(this.page, this.jobId);
            await this.logResult(campaignId, accountId, 'ERROR', `Lỗi: ${error.message}`, batchId, errorScreenPath);
            throw error;
        } finally {
            if (browser) await browser.close();
            for (const p of this.localMediaPaths) { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (e) { } }
            if (batchId) await this.checkCompletion(campaignId, batchId);
        }
    }
}

const handler = async (job: Job) => {
    const executor = new GroupPostExecutor(job.id!);
    return executor.execute(job);
};

export const autoPostGroupJob: JobDefinition = {
    handler,
    onFinalFailed: async (job: Job) => console.error(`Job ${job.id} failed.`)
};
