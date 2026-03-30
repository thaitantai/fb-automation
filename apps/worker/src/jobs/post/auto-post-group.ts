import { Job } from 'bullmq';
import { Page } from 'playwright';
import { prisma } from '@fb-automation/database';
import { browserDriver } from '../../drivers/browser';
import { SpintaxParser } from '../../utils/spintax';
import { JobDefinition } from '../types';
import { verifyLoginStatus } from '../../utils/fb-auth';
import { FB_SELECTORS } from '@fb-automation/constants';

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
        // Lấy toàn bộ dữ liệu cùng lúc để tối đa tốc độ
        const [account, template, group] = await Promise.all([
            prisma.fbAccount.findUnique({ where: { id: accountId } }),
            prisma.postTemplate.findUnique({ where: { id: templateId } }),
            prisma.fbGroup.findUnique({ where: { id: groupDbId } })
        ]);

        if (!account) throw new Error('Không tìm thấy tài khoản Facebook.');
        if (!template) throw new Error('Mẫu bài đăng không tồn tại hoặc đã bị xóa.');
        if (!group) throw new Error('Không tìm thấy thông tin nhóm.');

        if (account.status !== 'ACTIVE') {
            throw new Error(`[EarlyStop] Tài khoản đang ở trạng thái [${account.status}].`);
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
        const selectors = FB_SELECTORS.POST.COMPOSER_TRIGGERS;

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

        // Sử dụng Selector tập trung
        const textBoxSelector = FB_SELECTORS.POST.TEXTBOX;

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
        const postButtonSelectors = FB_SELECTORS.POST.SUBMIT_BUTTONS;

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
    async logResult(campaignId: string, accountId: string, status: 'SUCCESS' | 'ERROR', message: string, batchId?: string) {
        await prisma.jobLog.create({
            data: {
                campaignId,
                fbAccountId: accountId,
                batchId: batchId || null,
                actionType: status === 'SUCCESS' ? 'AUTO_POST' : 'AUTO_POST_ERROR',
                message,
                executedAt: new Date()
            } as any // Ép kiểu để bỏ qua lỗi TS nếu client chưa generate kịp
        });
    }

    /**
     * Giai đoạn 7: Kiểm tra hoàn tất chiến dịch (Theo Lượt Chạy)
     */
    async checkCompletion(campaignId: string, currentBatchId: string) {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { fbAccounts: { select: { id: true } } }
        });

        if (!campaign) return;

        const targetGroupIds = (campaign.targetConfigs as any)?.groupIds || [];
        const totalTargets = campaign.fbAccounts.length * targetGroupIds.length;

        // CHỈ ĐẾM LOG CỦA LƯỢT CHẠY HIỆN TẠI (Current Batch)
        const currentBatchLogs = await prisma.jobLog.findMany({
            where: {
                campaignId,
                batchId: currentBatchId
            }
        });

        const finishedJobsCount = currentBatchLogs.length;

        if (finishedJobsCount >= totalTargets) {
            console.log(`[Batch:${currentBatchId}] 🏁 Lượt chạy đã kết thúc. Đang đánh giá kết quả...`);

            // Kiểm tra có bài nào thành công không
            const hasSuccess = currentBatchLogs.some(log => log.actionType === 'AUTO_POST');
            const finalStatus = hasSuccess ? 'COMPLETED' : 'FAILED';

            console.log(`[Batch:${currentBatchId}] => Kết quả cuối: ${finalStatus}`);

            await prisma.campaign.update({
                where: { id: campaignId },
                data: { status: finalStatus } as any
            });
        }
    }

    /**
     * Khởi động luồng xử lý chính
     */
    async execute(job: Job) {
        const { campaignId, accountId, groupId, templateId, batchId } = job.data;
        let browser: any = null;

        try {
            // "CHẾ ĐỘ SIÊU TỐC": Vừa lấy dữ liệu DB, vừa khởi động trình duyệt cùng lúc
            const [data, launchResult] = await Promise.all([
                this.prepare(accountId, templateId, groupId),
                browserDriver.launch({ headless: false, desktop: true })
            ]);

            const { account, template, group } = data;
            browser = launchResult.browser;
            const context = launchResult.context;

            // Nạp Cookies và Di chuyển
            this.page = await context.newPage();
            await context.addCookies(JSON.parse(account.sessionData!));
            await this.navigateToGroup(`https://facebook.com/groups/${group.groupId}`);

            // Xác thực Login
            const isLoggedIn = await verifyLoginStatus(this.page, accountId, this.jobId);
            if (!isLoggedIn) {
                throw new Error('Cookies hết hạn. Đã tự động chuyển trạng thái thành DISCONNECTED.');
            }

            // Tiến hành đăng bài ngay
            const composerOpened = await this.openPostComposer();
            if (!composerOpened) throw new Error('Không thể mở ô soạn thảo (Có thể bị chặn đăng).');

            await this.typeMessage(template.contentSpintax);

            const posted = await this.submitPost();
            if (!posted) throw new Error('Không tìm thấy nút "Đăng" để thực thi.');

            await this.page.waitForTimeout(5000); // Chờ phản hồi
            await this.logResult(campaignId, accountId, 'SUCCESS', `Đăng thành công lên: ${group?.name || groupId}`, batchId);

            console.log(`[Job:${this.jobId}] ✅ Success!`);

        } catch (error: any) {
            console.error(`[Job:${this.jobId}] 🔴 Error: ${error.message}`);
            await this.logResult(campaignId, accountId, 'ERROR', `Lỗi: ${error.message}`, batchId);
            throw error;
        } finally {
            if (browser) await browser.close();
            // Luôn kiểm tra hoàn tất ở bước cuối cùng dành cho Batch hiện tại
            if (batchId) {
                await this.checkCompletion(campaignId, batchId);
            }
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
