import { Job } from 'bullmq';
import { Page, BrowserContext, Browser } from 'playwright';
import { JobDefinition } from '../types';
import { prisma } from '@fb-automation/database';
import { verifyLoginStatus } from '../../utils/fb-auth';
import { FB_SELECTORS } from '@fb-automation/constants';
import { setupBrowser, logActivityResult } from '../../utils/automation';

/**
 * Robot kiểm tra bài viết chờ duyệt (Cải tiến)
 */
class VerifyGroupPostExecutor {
    private page!: Page;
    private browser!: Browser;
    private jobId: string;

    constructor(jobId: string) {
        this.jobId = jobId;
    }

    async checkPendingPosts() {
        const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
        const now = new Date();

        const pendingGroups = await (prisma as any).fbGroup.findMany({
            where: {
                pendingSince: { not: null },
                status: 'ACTIVE'
            },
            include: { fbAccount: true }
        });

        for (const group of pendingGroups) {
            const timeElapsed = now.getTime() - (group as any).pendingSince!.getTime();
            if (timeElapsed < TWELVE_HOURS_MS) continue;

            console.log(`[VerifyJob] Đang kiểm tra nhóm: ${group.name} (${group.groupId})`);
            
            try {
                const setup = await setupBrowser((group as any).fbAccount);
                this.browser = setup.browser;
                this.page = setup.page;

                // Điều hướng tới trang "Bài viết của bạn" trong nhóm
                const yourPostsUrl = `https://facebook.com/groups/${group.groupId}/user/${(group as any).fbAccount.fbUid}/`;
                await this.page.goto(yourPostsUrl, { waitUntil: 'domcontentloaded' });
                await this.page.waitForTimeout(3000);

                if (!await verifyLoginStatus(this.page, (group as any).fbAccount.id, this.jobId, true)) {
                   throw new Error('Hết phiên đăng nhập khi đang check pending.');
                }

                // Kiểm tra xem có bài "Đang chờ" (Pending) không
                const isStillPending = await this.page.locator(':has-text("Đang chờ phê duyệt"), :has-text("Pending Approval"), :has-text("Pending")').isVisible();
                
                if (isStillPending) {
                    const newCount = (group as any).pendingCheckCount + 1;
                    if (newCount >= 3) {
                        // Quá 3 lần check (36 tiếng) mà vẫn pending -> Cho vào danh sách đen
                        await (prisma as any).fbGroup.update({
                            where: { id: group.id },
                            data: { 
                                status: 'BLACKLISTED',
                                pendingSince: null,
                                pendingCheckCount: 3
                            }
                        });
                        console.log(`[VerifyJob] 🔴 Đã đưa nhóm ${group.name} vào danh sách đen (Tỉ lệ duyệt quá thấp).`);
                    } else {
                        // Tăng biến đếm
                        await (prisma as any).fbGroup.update({
                            where: { id: group.id },
                            data: { pendingCheckCount: newCount }
                        });
                        console.log(`[VerifyJob] ⏳ Nhóm ${group.name} vẫn còn pending (Lần ${newCount}).`);
                    }
                } else {
                    // Nếu không còn thấy pending -> Có thể đã được duyệt hoặc bị xóa
                    // Reset trạng thái pending để lần sau đăng tiếp
                    await (prisma as any).fbGroup.update({
                        where: { id: group.id },
                        data: { 
                            pendingSince: null, 
                            pendingCheckCount: 0 
                        }
                    });
                    console.log(`[VerifyJob] ✅ Nhóm ${group.name} đã được xử lý (Đã duyệt/Xóa).`);
                }

            } catch (error: any) {
                console.error(`[VerifyJob] Lỗi khi check group ${group.name}: ${error.message}`);
            } finally {
                if (this.browser) await this.browser.close();
            }
        }
    }

    async execute(job: Job) {
        await this.checkPendingPosts();
    }
}

export const verifyGroupPostJob: JobDefinition = {
    handler: async (job: Job) => new VerifyGroupPostExecutor(job.id!).execute(job),
};
