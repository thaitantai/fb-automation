import { Job } from 'bullmq';
import { Page, BrowserContext, Browser } from 'playwright';
import { prisma } from '@fb-automation/database';
import path from 'path';
import fs from 'fs';
import { JobDefinition } from '../types';
import { verifyLoginStatus } from '../../utils/fb-auth';
import { FB_SELECTORS } from '@fb-automation/constants';
import { captureErrorScreenshot } from '../../utils/screenshot';
import {
    AutomationParams,
    prepareData,
    processAutomationContent,
    setupBrowser,
    logActivityResult,
    checkCampaignCompletion,
    simulateHumanTyping
} from '../../utils/automation';

/**
 * Lớp điều khiển luồng ĐĂNG BÀI nhóm tự động (Master Logic - Clean Utils)
 */
class GroupPostExecutor {
    private page!: Page;
    private context!: BrowserContext;
    private browser!: Browser;
    private jobId: string;
    private localMediaPaths: string[] = [];
    private jobDir: string;

    constructor(jobId: string) {
        this.jobId = jobId;
        this.jobDir = path.join(process.cwd(), 'tmp', 'jobs', jobId);
    }

    private async reportProgress(params: AutomationParams, step: number, message: string) {
        return logActivityResult(params, 'ACTIVITY', `[STEP:${step}/6] ${message}`);
    }

    async performAutomation(group: any, protectedContent: string, params: AutomationParams) {
        // Bước 1: Điều hướng
        await this.reportProgress(params, 1, '🚀 Đang truy cập nhóm mục tiêu...');
        await this.page.goto(`https://facebook.com/groups/${group.groupId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.page.evaluate(() => window.scrollBy(0, 400));
        await this.page.waitForTimeout(2000);

        if (!await verifyLoginStatus(this.page, params.accountId, this.jobId, true)) {
            throw new Error('[SmartError] Cookies hết hạn hoặc checkpoint.');
        }

        // Bước 2: Mở trình soạn thảo
        await this.reportProgress(params, 2, '📂 Đang mở trình soạn thảo...');
        if (await this.page.locator(FB_SELECTORS.STATUS.NOT_JOINED).first().isVisible({ timeout: 5000 })) {
            throw new Error('[SmartError] CHƯA THAM GIA nhóm.');
        }

        let opened = false;
        for (const sel of FB_SELECTORS.POST.COMPOSER_TRIGGERS) {
            if (await this.page.locator(sel).isVisible({ timeout: 3000 })) {
                await this.page.click(sel);
                opened = true;
                break;
            }
        }
        if (!opened) throw new Error('[SmartError] Không tìm thấy ô soạn bài.');
        await this.page.waitForTimeout(2000);

        // Bước 3: Nạp Media
        if (this.localMediaPaths.length > 0) {
            await this.reportProgress(params, 3, '🖼️ Đang nạp media vào trình duyệt...');
            const fileInput = this.page.locator(FB_SELECTORS.POST.FILE_INPUT);
            if (await fileInput.count() > 0) {
                await fileInput.first().setInputFiles(this.localMediaPaths);
            } else {
                const [fileChooser] = await Promise.all([
                    this.page.waitForEvent('filechooser', { timeout: 10000 }),
                    this.page.click(FB_SELECTORS.POST.PHOTO_VIDEO_BUTTON)
                ]);
                await fileChooser.setFiles(this.localMediaPaths);
            }
            await this.page.waitForSelector(FB_SELECTORS.POST.UPLOAD_COMPLETE_INDICATOR, { timeout: 15000 }).catch(() => { });
            await this.page.waitForTimeout(1500);
        }

        // Bước 4: Soạn văn bản
        await this.reportProgress(params, 4, '⌨️ Đang soạn nội dung bài viết...');
        const textBox = this.page.locator(FB_SELECTORS.POST.TEXTBOX).first();
        await textBox.waitFor({ timeout: 15000 });
        await simulateHumanTyping(this.page, textBox, protectedContent);

        // Bước 5: Đăng bài
        await this.reportProgress(params, 5, '📤 Đang gửi bài viết...');
        let submitted = false;
        for (const sel of FB_SELECTORS.POST.SUBMIT_BUTTONS) {
            const btn = this.page.locator(sel).first();
            if (await btn.isVisible() && await btn.isEnabled()) {
                await btn.click({ force: true });
                submitted = true;
                break;
            }
        }
        if (!submitted) throw new Error('[SmartError] Nút đăng bị lỗi.');
        await this.page.waitForTimeout(2000); // Đợi ngắn rồi mới check result

        // Bước 6: Phân tích kết quả
        await this.reportProgress(params, 6, '🔍 Đang kiểm tra trạng thái bài đăng...');
        const result = await this.analyzeResult();
        if (result.status === 'ERROR') throw new Error(result.message);

        // Cập nhật Database nếu nhóm thuộc loại duyệt bài (Cải tiến)
        if (result.actionType === 'PENDING') {
            await (prisma as any).fbGroup.update({
                where: { id: group.id },
                data: {
                    isModerated: true,
                    pendingSince: new Date(),
                    pendingCheckCount: 0
                }
            });
        } else if (result.actionType === 'COMPLETE') {
            // Nếu tự duyệt, xóa trạng thái pending cũ nếu có
            await (prisma as any).fbGroup.update({
                where: { id: group.id },
                data: { pendingSince: null, pendingCheckCount: 0 }
            });
        }

        await logActivityResult(params, 'SUCCESS', result.message, result.actionType);
    }

    private async analyzeResult() {
        // Chờ thêm một chút để các toast/alert xuất hiện kịp
        const checkPending = this.page.locator(FB_SELECTORS.STATUS.PENDING_APPROVAL).first();
        const checkBlocked = this.page.locator(FB_SELECTORS.STATUS.BLOCKED).first();
        const composer = this.page.locator('div[role="dialog"]').first();

        // Thử kiểm tra trong vòng 5 giây (polling)
        for (let i = 0; i < 5; i++) {
            if (await checkBlocked.isVisible()) {
                return { status: 'ERROR', actionType: 'ERROR', message: 'Tài khoản bị chặn đăng bài.' };
            }
            if (await checkPending.isVisible()) {
                return { status: 'SUCCESS', actionType: 'PENDING', message: 'Bài viết đã được gửi và đang chờ quản trị viên phê duyệt.' };
            }

            // Nếu composer đã đóng, khả năng cao là thành công
            if (!(await composer.isVisible())) {
                await this.page.waitForTimeout(1500); // Đợi thêm 1 chút để toast message kịp hiện nếu có
                if (await checkPending.isVisible()) {
                    return { status: 'SUCCESS', actionType: 'PENDING', message: 'Bài viết đã được gửi và đang chờ quản trị viên phê duyệt.' };
                }
                return { status: 'SUCCESS', actionType: 'COMPLETE', message: 'Đăng bài thành công.' };
            }

            await this.page.waitForTimeout(1000);
        }

        // Nếu sau 5s composer vẫn còn đó, có thể là lỗi nội dung hoặc submit chưa ăn
        if (await composer.isVisible()) {
            return { status: 'ERROR', actionType: 'ERROR', message: 'Hộp thoại đăng bài không tự đóng. Có thể do lỗi mạng hoặc nội dung vi phạm chính sách.' };
        }

        return { status: 'SUCCESS', actionType: 'COMPLETE', message: 'Đăng bài thành công (Mặc định).' };
    }

    async execute(job: Job) {
        const params: AutomationParams = job.data;
        let campaignType = 'AUTO_POST'; // Default
        try {
            const { account, template, group, campaign } = await prepareData(params);
            campaignType = campaign.type;

            // [Cải tiến] Kiểm tra trạng thái duyệt bài của nhóm "khó tính"
            if ((group as any).isModerated && (group as any).pendingSince) {
                const checkCount = (group as any).pendingCheckCount || 0;
                await logActivityResult(
                    params,
                    'ACTIVITY',
                    `[Bỏ qua] Nhóm có bài đang chờ duyệt (Đã check ${checkCount}/3 lần). Đợi quản trị viên duyệt bài cũ mới đăng tiếp.`,
                    'SKIP'
                );
                return;
            }

            // [MASTER ANTI-SPAM] Kiểm tra lịch sử tương tác thực tế trong 24h qua
            // Nếu đã từng đăng bài hoặc comment vào nhóm này trong vòng 24h, ta sẽ bỏ qua để né thuật toán Spam của FB
            const lastInteraction = await prisma.jobLog.findFirst({
                where: {
                    fbAccountId: account.id,
                    targetId: group.groupId,
                    executedAt: {
                        gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Con số VÀNG: 2 giờ dãn cách cho mỗi nhóm
                    },
                    actionType: { in: ['COMPLETE', 'PENDING'] }
                },
                orderBy: { executedAt: 'desc' }
            });

            if (lastInteraction) {
                const hoursAgo = Math.floor((Date.now() - lastInteraction.executedAt.getTime()) / (1000 * 60 * 60));
                await logActivityResult(
                    params,
                    'ACTIVITY',
                    `[Bỏ qua] Đã tương tác với nhóm này ${hoursAgo} giờ trước. Để đảm bảo an toàn spam, robot sẽ bỏ qua lượt này.`,
                    'SKIP'
                );
                return;
            }

            const { protectedContent, mediaPaths } = await processAutomationContent(template, (campaign as any).protectionConfig, this.jobDir, this.jobId);
            this.localMediaPaths = mediaPaths;

            const setup = await setupBrowser(account);
            this.browser = setup.browser;
            this.context = setup.context;
            this.page = setup.page;

            await this.performAutomation(group, protectedContent, params);

        } catch (error: any) {
            console.error(`[Job:${this.jobId}] 🔴 Lỗi: ${error.message}`);
            await captureErrorScreenshot(this.page, this.jobId);
            await logActivityResult(params, 'ERROR', `Thất bại: ${error.message}`, 'ERROR');
            throw error;
        } finally {
            if (this.browser) await this.browser.close().catch(() => { });
            if (fs.existsSync(this.jobDir)) fs.rmSync(this.jobDir, { recursive: true, force: true });
            if (params.batchId) await checkCampaignCompletion(params.campaignId, params.batchId, 'COMPLETE');
        }
    }
}

export const autoPostGroupJob: JobDefinition = {
    handler: async (job: Job) => new GroupPostExecutor(job.id!).execute(job),
    onFinalFailed: async (job: Job) => console.error(`Job ${job.id} post final failure.`)
};
