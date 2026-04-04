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
 * Lớp điều khiển luồng BÌNH LUẬN nhóm tự động (Master Logic - Clean Utils)
 */
class GroupCommentExecutor {
    private page!: Page;
    private context!: BrowserContext;
    private browser!: Browser;
    private jobId: string;
    private jobDir: string;

    constructor(jobId: string) {
        this.jobId = jobId;
        this.jobDir = path.join(process.cwd(), 'tmp', 'jobs', jobId);
    }

    private async reportProgress(params: AutomationParams, step: number, message: string) {
        return logActivityResult(params, 'ACTIVITY', `[STEP:${step}/5] ${message}`);
    }

    async performAutomation(group: any, protectedContent: string, params: AutomationParams) {
        // Bước 1: Truy cập nhóm
        await this.reportProgress(params, 1, '🚀 Đang vào nhóm để tìm bài viết...');
        await this.page.goto(`https://facebook.com/groups/${group.groupId}?sorting_setting=CHRONOLOGICAL`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        await this.page.waitForSelector('body', { timeout: 15000 });
        await this.page.waitForTimeout(3000);

        if (!await verifyLoginStatus(this.page, params.accountId, this.jobId, true)) {
            throw new Error('[SmartError] Hết phiên đăng nhập.');
        }

        // Bước 2: Cuộn tìm bài viết
        await this.reportProgress(params, 2, '🔍 Đang cuộn tìm bài viết mới nhất...');
        await this.page.evaluate(() => window.scrollBy(0, 800));
        await this.page.waitForTimeout(2000);

        // Bước 3: Tìm ô comment đầu tiên
        await this.reportProgress(params, 3, '💬 Đang xác định ô bình luận...');
        const commentBoxSelector = FB_SELECTORS.COMMENT.TEXTBOX;
        const commentBox = this.page.locator(commentBoxSelector).first();

        if (await commentBox.count() === 0) {
            const trigger = this.page.locator(FB_SELECTORS.COMMENT.TRIGGER).first();
            if (await trigger.count() > 0) {
                await trigger.click();
                await this.page.waitForTimeout(1500);
            } else {
                throw new Error('[SmartError] Không tìm thấy bài viết hoặc bài viết bị khóa comment.');
            }
        }

        await commentBox.waitFor({ timeout: 10000 });

        // Bước 4: Nhập nội dung (Sử dụng chuẩn Senior Typing)
        await this.reportProgress(params, 4, '⌨️ Đang viết bình luận...');
        await simulateHumanTyping(this.page, commentBox, protectedContent);

        // Bước 5: Gửi bình luận
        await this.reportProgress(params, 5, '📤 Đang gửi bình luận...');

        // Nhấn Escape trước để đóng các bảng gợi ý (Mention, Emoji picker...) có thể chặn phím Enter
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);

        // Nhấn Enter để gửi bài (một lần duy nhất cực kỳ chuẩn xác)
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(4000);

        // Kiểm tra chặn
        if (await this.page.locator(FB_SELECTORS.STATUS.BLOCKED).first().isVisible({ timeout: 2000 })) {
            throw new Error('Tài khoản bị hạn chế bình luận.');
        }

        await logActivityResult(params, 'SUCCESS', 'Bình luận thành công.', 'COMPLETE');
    }

    async execute(job: Job) {
        const params: AutomationParams = job.data;
        try {
            const { account, template, group, campaign } = await prepareData(params);
            
            // [Cải tiến] Kiểm tra trạng thái duyệt bài của nhóm "khó tính"
            // Nếu nhóm đang có bài chờ duyệt chưa được xử lý, ta sẽ bỏ qua lượt comment này cho an toàn
            if ((group as any).isModerated && (group as any).pendingSince) {
                const checkCount = (group as any).pendingCheckCount || 0;
                await logActivityResult(
                    params, 
                    'ACTIVITY', 
                    `[Bỏ qua] Nhóm có bài đang chờ duyệt (Đã check ${checkCount}/3 lần). Tạm dừng comment để đảm bảo an toàn account.`, 
                    'SKIP'
                );
                return;
            }

            const { protectedContent } = await processAutomationContent(template, (campaign as any).protectionConfig, this.jobDir, this.jobId);

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

export const autoCommentGroupJob: JobDefinition = {
    handler: async (job: Job) => new GroupCommentExecutor(job.id!).execute(job),
    onFinalFailed: async (job: Job) => console.error(`Job ${job.id} comment final failure.`)
};
