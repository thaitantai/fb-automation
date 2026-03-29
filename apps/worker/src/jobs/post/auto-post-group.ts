import { Job } from 'bullmq';
import { Page } from 'playwright';
import { prisma } from '@fb-automation/database';
import { browserDriver } from '../../drivers/browser';
import { SpintaxParser } from '../../utils/spintax';
import { JobDefinition } from '../types';

/**
 * Lớp điều khiển luồng đăng bài tự động (Clean Architecture)
 */
class GroupPostExecutor {
    private page!: Page;
    private jobId: string;

    constructor(jobId: string) {
        this.jobId = jobId;
    }

    /**
     * Giai đoạn 1: Chuẩn bị dữ liệu và Môi trường
     */
    async prepare(accountId: string, templateId: string, groupDbId: string) {
        const [account, template, group] = await Promise.all([
            prisma.fbAccount.findUnique({ where: { id: accountId } }),
            prisma.postTemplate.findUnique({ where: { id: templateId } }),
            prisma.fbGroup.findUnique({ where: { id: groupDbId } })
        ]);

        if (!account || !account.sessionData || !template) {
            throw new Error('Tài khoản, mẫu bài hoặc thông tin nhóm không khả dụng.');
        }

        return { account, template, group };
    }

    /**
     * Giai đoạn 2: Điều hướng và Mô phỏng người dùng (Antib-Ban)
     */
    async navigateToGroup(url: string) {
        console.log(`[Job:${this.jobId}] 🚀 Đang vào nhóm: ${url}`);
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Mô phỏng con người: Cuộn nhẹ và nghỉ ngơi
        await this.page.evaluate(() => window.scrollBy(0, 400));
        await this.page.waitForTimeout(Math.floor(Math.random() * 2000) + 2000);
    }

    /**
     * Giai đoạn 3: Tương tác với ô nhập nội dung
     */
    async openPostComposer() {
        const selectors = [
            'span:has-text("Write something...")',
            'span:has-text("Bạn viết gì đi...")',
            'div[role="button"]:has-text("Write something...")',
            'div[role="button"]:has-text("Bạn viết gì đi...")'
        ];

        for (const sel of selectors) {
            if (await this.page.locator(sel).isVisible({ timeout: 3000 })) {
                await this.page.click(sel);
                return true;
            }
        }
        return false;
    }

    /**
     * Giai đoạn 4: Soạn thảo văn bản (Human Typing)
     */
    async typeMessage(content: string) {
        const finalizedContent = SpintaxParser.parse(content);
        
        // CHỈNH SỬA: Selector chính xác cho ô đăng bài (tránh ô bình luận)
        const textBoxSelector = 'div[role="dialog"] div[role="textbox"], div[aria-label*="đang nghĩ gì"], div[aria-label*="on your mind"]';
        
        console.log(`[Job:${this.jobId}] ⏳ Đang chờ ô soạn thảo bài viết...`);
        await this.page.waitForSelector(textBoxSelector, { timeout: 15000 });
        
        const messageBox = this.page.locator(textBoxSelector).first();
        
        // Sử dụng force: true để ép nhấn nếu bị các lớp khác che khuất
        await messageBox.click({ force: true });
        
        console.log(`[Job:${this.jobId}] ⌨️ Đang soạn bài (Mô phỏng bàn phím)...`);
        
        // Nhấn focus lại một lần nữa trước khi gõ
        await this.page.keyboard.type(finalizedContent, { delay: Math.floor(Math.random() * 80) + 40 });
        await this.page.waitForTimeout(2000);
    }

    /**
     * Giai đoạn 5: Thực thi gửi bài
     */
    async submitPost() {
        const postButtonSelectors = [
            'div[role="dialog"] div[aria-label="Post"]', 
            'div[role="dialog"] div[aria-label="Đăng"]',
            'div[role="dialog"] div[role="button"]:has-text("Post")',
            'div[role="dialog"] div[role="button"]:has-text("Đăng")'
        ];

        for (const sel of postButtonSelectors) {
            try {
                const btn = this.page.locator(sel);
                if (await btn.isVisible()) {
                    await btn.click({ force: true });
                    return true;
                }
            } catch (e) { }
        }
        return false;
    }

    /**
     * Giai đoạn 6: Ghi nhật ký (Logging)
     */
    async logResult(campaignId: string, accountId: string, status: 'SUCCESS' | 'ERROR', message: string) {
        await prisma.jobLog.create({
            data: {
                campaignId,
                fbAccountId: accountId,
                actionType: status === 'SUCCESS' ? 'AUTO_POST' : 'AUTO_POST_ERROR',
                message,
                executedAt: new Date()
            }
        });
    }

    /**
     * Khởi động luồng xử lý chính
     */
    async execute(job: Job) {
        const { campaignId, accountId, groupId, templateId } = job.data;

        // groupId ở đây đang là Database ID (UUID)
        const { account, template, group } = await this.prepare(accountId, templateId, groupId);
        console.log("GROUP: ", group)
        // CHỈNH SỬA QUAN TRỌNG: Sử dụng group.groupId (ID thật của FB) để vào link
        if (!group?.groupId) throw new Error('Không tìm thấy Facebook ID hợp lệ cho nhóm này.');

        const { browser, context } = await browserDriver.launch({ headless: false, desktop: true });

        try {
            this.page = await context.newPage();
            await context.addCookies(JSON.parse(account.sessionData!));

            // Truy cập với Facebook Group ID thực tế
            await this.navigateToGroup(`https://facebook.com/groups/${group.groupId}`);

            const composerOpened = await this.openPostComposer();
            if (!composerOpened) throw new Error('Không thể mở ô soạn thảo (Có thể bị chặn đăng).');

            await this.typeMessage(template.contentSpintax);

            const posted = await this.submitPost();
            if (!posted) throw new Error('Không tìm thấy nút "Đăng" để thực thi.');

            await this.page.waitForTimeout(5000); // Chờ phản hồi
            await this.logResult(campaignId, accountId, 'SUCCESS', `Đăng thành công lên: ${group?.name || groupId}`);

            console.log(`[Job:${this.jobId}] ✅ Success!`);

        } catch (error: any) {
            console.error(`[Job:${this.jobId}] 🔴 Error: ${error.message}`);
            await this.logResult(campaignId, accountId, 'ERROR', `Lỗi: ${error.message}`);
            throw error;
        } finally {
            await browser.close();
        }
    }
}

/**
 * Worker Handler Linker
 */
const handler = async (job: Job) => {
    const executor = new GroupPostExecutor(job.id!);
    return executor.execute(job);
};

export const autoPostGroupJob: JobDefinition = {
    handler,
    onFinalFailed: async (job: Job) => console.error(`Job ${job.id} failed permanently.`)
};
