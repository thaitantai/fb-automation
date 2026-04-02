import { Job } from 'bullmq';
import { Page, BrowserContext, Browser } from 'playwright';
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
        if (await this.page.locator(FB_SELECTORS.STATUS.NOT_JOINED).isVisible({ timeout: 5000 })) {
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
                await fileInput.setInputFiles(this.localMediaPaths);
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
            const btn = this.page.locator(sel);
            if (await btn.isVisible() && await btn.isEnabled()) {
                await btn.click({ force: true });
                submitted = true;
                break;
            }
        }
        if (!submitted) throw new Error('[SmartError] Nút đăng bị lỗi.');
        await this.page.waitForTimeout(4000);

        // Bước 6: Phân tích kết quả
        await this.reportProgress(params, 6, '🔍 Đang kiểm tra trạng thái bài đăng...');
        const result = await this.analyzeResult();
        if (result.status === 'ERROR') throw new Error(result.message);

        await logActivityResult(params, 'SUCCESS', result.message, result.actionType);
    }

    private async analyzeResult() {
        if (await this.page.locator(FB_SELECTORS.STATUS.BLOCKED).isVisible({ timeout: 2000 })) {
            return { status: 'ERROR', actionType: 'AUTO_POST_ERROR', message: 'Tài khoản bị chặn đăng bài.' };
        }
        if (await this.page.locator(FB_SELECTORS.STATUS.PENDING_APPROVAL).isVisible({ timeout: 2000 })) {
            return { status: 'SUCCESS', actionType: 'AUTO_POST_PENDING', message: 'Bài viết đang chờ Admin duyệt.' };
        }
        return { status: 'SUCCESS', actionType: 'AUTO_POST', message: 'Đăng thành công.' };
    }

    async execute(job: Job) {
        const params: AutomationParams = job.data;
        try {
            const { account, template, group, campaign } = await prepareData(params);
            const { protectedContent, mediaPaths } = await processAutomationContent(template, (campaign as any).protectionConfig, this.jobDir, this.jobId);
            this.localMediaPaths = mediaPaths;

            const setup = await setupBrowser(account);
            this.browser = setup.browser;
            this.context = setup.context;
            this.page = setup.page;

            await this.performAutomation(group, protectedContent, params);

        } catch (error: any) {
            console.error(`[Job:${this.jobId}] 🔴 Lỗi: ${error.message}`);
            const errorScr = await captureErrorScreenshot(this.page, this.jobId);
            await logActivityResult(params, 'ERROR', `Thất bại: ${error.message}`, 'AUTO_POST_ERROR');
            throw error;
        } finally {
            if (this.browser) await this.browser.close().catch(() => {});
            if (fs.existsSync(this.jobDir)) fs.rmSync(this.jobDir, { recursive: true, force: true });
            if (params.batchId) await checkCampaignCompletion(params.campaignId, params.batchId, 'AUTO_POST');
        }
    }
}

export const autoPostGroupJob: JobDefinition = {
    handler: async (job: Job) => new GroupPostExecutor(job.id!).execute(job),
    onFinalFailed: async (job: Job) => console.error(`Job ${job.id} post final failure.`)
};
