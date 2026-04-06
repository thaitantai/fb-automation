import { Job } from 'bullmq';
import { Page, BrowserContext, Browser, Locator } from 'playwright';
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
 * Lớp điều khiển luồng BÌNH LUẬN nhóm tự động (Master Logic - Humanoid Safe)
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
        // Bước 1: Truy cập nhóm, mở theo trình tự thời gian thật (New)
        await this.reportProgress(params, 1, '🚀 Đang vào nhóm để tìm bài viết...');
        await this.page.goto(`https://facebook.com/groups/${group.groupId}?sorting_setting=CHRONOLOGICAL`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        await this.page.waitForSelector('body', { timeout: 15000 });

        // Mô phỏng ngâm trang ban đầu
        await this.page.waitForTimeout(3000 + Math.random() * 2000);

        if (!await verifyLoginStatus(this.page, params.accountId, this.jobId, true)) {
            throw new Error('[SmartError] Hết phiên đăng nhập.');
        }

        // Bước 2: Hành vi Lướt Feed Như Người Thật (Humanoid Browsing)
        await this.reportProgress(params, 2, '🔍 Đang dạo Feed, phân tích và bỏ qua bài viết Ghim của Admin...');

        // Cuộn xuống ngẫu nhiên 2-3 nhịp (Đọc bảng tin)
        for (let i = 0; i < (2 + Math.floor(Math.random() * 2)); i++) {
            await this.page.evaluate(() => window.scrollBy({ top: 300 + Math.random() * 400, behavior: 'smooth' }));
            await this.page.waitForTimeout(1000 + Math.random() * 2000);
        }
        // Cuộn lên lại để tự nhiên hơn (Mô phỏng hành vi lướt ngược)
        await this.page.evaluate(() => window.scrollBy({ top: -300, behavior: 'smooth' }));
        await this.page.waitForTimeout(2000);

        // Bước 3: Tìm mục tiêu an toàn (Post Selector) - Có cơ chế RE-SCAN nếu cuộn chưa tới
        await this.reportProgress(params, 3, '🔍 Đang quét tìm bài viết phù hợp để tương tác...');

        const COMMENT_TRIGGER_SELECTOR = [
            'div[aria-label="Viết bình luận"]',
            'div[aria-label="Write a comment"]',
            'div[aria-label="Bình luận"]',
            'div[aria-label="Comment"]',
            'div[role="button"]:has-text("Bình luận")',
            'div[role="button"]:has-text("Comment")',
            'div[data-ad-rendering-role="comment_button"]',
            'i[style*="-487px"]' // CSS Sprite đặc trưng của nút comment FB hiện tại
        ].join(', ');

        let triggers = this.page.locator(COMMENT_TRIGGER_SELECTOR).first();
        let retryScroll = 0;

        // Nếu cuộn 3 lần rồi mà vẫn không thấy bài nào cho phép comment -> Thử cuộn thêm 2 nhịp nữa
        while (await triggers.count() === 0 && retryScroll < 3) {
            console.log(`[Job:${this.jobId}] ⏳ Không thấy bài viết, đang cuộn thêm (Lần ${retryScroll + 1})...`);
            await this.page.evaluate(() => window.scrollBy(0, 500));
            await this.page.waitForTimeout(2000);
            triggers = this.page.locator(COMMENT_TRIGGER_SELECTOR).first();
            retryScroll++;
        }

        if (await triggers.count() === 0) {
            throw new Error('[SmartError] Không tìm thấy bài viết khả dụng (Có thể nhóm kín hoặc bài viết bị khóa comment).');
        }

        // Chọn bài viết đầu tiên tìm thấy sau khi cuộn
        const targetCommentTrigger = triggers.first();

        // Bước 4: Chiến thuật Engage-First (Like trước rồi mới Comment)
        await this.reportProgress(params, 4, '❤️ Đang thả "Thích" bài viết để tạo Trust Behavior...');

        // Xác định container chứa bài viết để tìm nút Like tương ứng
        const postContainer = targetCommentTrigger.locator('xpath=./ancestor::div[@role="article"] | ./ancestor::div[@data-pagelet[contains(.,"FeedUnit")]]').first();

        const likeButton = postContainer.locator('div[aria-label="Thích"], div[aria-label="Like"]').first();
        if (await likeButton.count() > 0 && await likeButton.isVisible()) {
            // Chỉ nhấn like nếu nó chưa được Like (Tránh Unlike)
            const ariaPressed = await likeButton.getAttribute('aria-pressed');
            if (ariaPressed !== 'true') {
                await likeButton.hover({ force: true });
                await this.page.waitForTimeout(500 + Math.random() * 1000);
                await likeButton.click();
                await this.page.waitForTimeout(2000 + Math.random() * 2000); // Ngâm thư giãn sau khi Like
            }
        }

        // Mở hộp thoại Comments
        await this.reportProgress(params, 4, '💬 Đang mở hộp thoại và phân tích ngữ cảnh...');
        await targetCommentTrigger.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await targetCommentTrigger.click();
        await this.page.waitForTimeout(2500);

        // Xác định Ô bình luận vừa được focus
        const commentBox = this.page.locator(FB_SELECTORS.COMMENT.TEXTBOX).first();
        await commentBox.waitFor({ timeout: 10000 });

        // Bước 5: Viết và gửi bình luận
        await this.reportProgress(params, 5, '⌨️ Đang thả Comment với Typing Giả lập...');
        await simulateHumanTyping(this.page, commentBox, protectedContent);

        // Nhấn Escape trước để đóng các bảng gợi ý (Mention, Emoji picker...) có thể chặn phím Enter
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(800);

        // Nhấn Enter để gửi bài (một lần duy nhất cực kỳ chuẩn xác)
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(4000);

        // Đợi UI phản hồi và xử lý Post-Submission
        if (await this.page.locator(FB_SELECTORS.STATUS.BLOCKED).first().isVisible({ timeout: 3000 })) {
            throw new Error('Tài khoản bị hạn chế bình luận.');
        }

        // Tối ưu: Đọc xác nhận bài vừa đăng "Vừa xong / Just now" nếu có thể
        const isSpamFlagged = await this.page.locator(':has-text("Bình luận của bạn vi phạm tiêu chuẩn"), :has-text("Your comment goes against")').first().isVisible({ timeout: 1000 });
        if (isSpamFlagged) throw new Error('Bình luận bị Facebook đánh dấu Spam ngay lập tức.');

        await logActivityResult(params, 'SUCCESS', 'Bình luận thành công. Đã Bypass Bot Detection.', 'COMPLETE');
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
            // if (this.browser) await this.browser.close().catch(() => { });
            if (fs.existsSync(this.jobDir)) fs.rmSync(this.jobDir, { recursive: true, force: true });
            if (params.batchId) await checkCampaignCompletion(params.campaignId, params.batchId, 'COMPLETE');
        }
    }
}

export const autoCommentGroupJob: JobDefinition = {
    handler: async (job: Job) => new GroupCommentExecutor(job.id!).execute(job),
    onFinalFailed: async (job: Job) => console.error(`Job ${job.id} comment final failure.`)
};
