import { Page, BrowserContext, Browser } from 'playwright';
import path from 'path';
import fs from 'fs';
import { prisma } from '@fb-automation/database';
import { browserDriver } from '../drivers/browser';
import { applyFullProtection, checkCampaignCompletion } from '@fb-automation/utils';

export interface AutomationParams {
    campaignId: string;
    accountId: string;
    groupId: string;
    templateId: string;
    batchId?: string;
}

/**
 * 1. CHUẨN BỊ DỮ LIỆU (Pre-Browser Phase)
 */
export async function prepareData(params: AutomationParams) {
    const { accountId, templateId, groupId, campaignId } = params;
    const [account, template, group, campaign] = await Promise.all([
        prisma.fbAccount.findUnique({ where: { id: accountId } }),
        prisma.postTemplate.findUnique({ where: { id: templateId } }),
        prisma.fbGroup.findUnique({ where: { id: groupId } }),
        prisma.campaign.findUnique({ where: { id: campaignId } })
    ]);

    if (!account || !template || !group || !campaign) throw new Error('Dữ liệu không đầy đủ hoặc không tìm thấy thông tin.');
    if (account.status !== 'ACTIVE') throw new Error(`[EarlyStop] Tài khoản đang ở trạng thái [${account.status}].`);
    if ((group as any).status === 'BLACKLISTED') throw new Error(`[EarlyStop] Nhóm đang trong Danh Sách Đen (Cấm đăng do khó tính).`);

    return { account, template, group, campaign };
}

/**
 * 2. XỬ LÝ NỘI DUNG & MEDIA (CPU/IO Phase)
 */
export async function processAutomationContent(template: any, protectionConfig: any, jobDir: string, jobId: string) {
    const [protectedContent, mediaPaths] = await Promise.all([
        applyFullProtection(template.contentSpintax, protectionConfig || {}, process.env.GEMINI_API_KEY),
        downloadMedia(template.mediaUrls, jobDir, jobId)
    ]);
    return { protectedContent, mediaPaths };
}

async function downloadMedia(mediaLinks: any, jobDir: string, jobId: string): Promise<string[]> {
    if (!mediaLinks) return [];
    const urls = Array.isArray(mediaLinks) ? mediaLinks : JSON.parse(mediaLinks as string);
    if (urls.length === 0) return [];

    if (!fs.existsSync(jobDir)) fs.mkdirSync(jobDir, { recursive: true });

    return await Promise.all(urls.map(async (url: string, i: number) => {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            const filePath = path.join(jobDir, `img_${i}${path.extname(url) || '.jpg'}`);
            fs.writeFileSync(filePath, Buffer.from(buffer));
            return filePath;
        } catch (err) {
            console.warn(`[Job:${jobId}] ⚠️ Lỗi tải media: ${url}`);
            return '';
        }
    })).then(paths => paths.filter(p => p !== ''));
}

/**
 * 3. THIẾT LẬP TRÌNH DUYỆT (Automation Setup)
 */
export async function setupBrowser(account: any) {
    const { browser, context } = await browserDriver.launch({ headless: false, desktop: true });

    // Block unnecessary requests
    await context.route('**/*', (route, request) => {
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

    const page = await context.newPage();
    await context.addCookies(JSON.parse(account.sessionData!));

    return { browser, context, page };
}

/**
 * 4. LOGGING & TRẠNG THÁI (Tracking utils)
 */
export async function logActivityResult(params: AutomationParams, status: 'SUCCESS' | 'ERROR' | 'ACTIVITY', message: string, actionType?: string) {
    const { campaignId, accountId, groupId, batchId } = params;
    const finalType = actionType || (status === 'SUCCESS' ? 'COMPLETE' : status === 'ERROR' ? 'ERROR' : 'ACTIVITY');

    // [Senior Logic] Tìm log hiện tại của target này trong batch này để cập nhật (tránh spam và kẹt status)
    const existing = await prisma.jobLog.findFirst({
        where: { campaignId, fbAccountId: accountId, targetId: groupId, batchId },
        orderBy: { executedAt: 'desc' }
    });

    if (existing && (existing.actionType === 'SCHEDULED' || existing.actionType === 'ACTIVITY')) {
        return prisma.jobLog.update({
            where: { id: existing.id },
            data: { actionType: finalType, message, executedAt: new Date() }
        });
    }

    return prisma.jobLog.create({
        data: {
            campaignId, fbAccountId: accountId, batchId: batchId || null,
            targetId: groupId || null, actionType: finalType,
            message, executedAt: new Date()
        } as any
    });
}

/**
 * 5. MÔ PHỎNG GÕ PHÍM GIẢ LẬP NGƯỜI THẬT (Human-like Typing)
 */
export async function simulateHumanTyping(page: Page, element: any, text: string, options: { delayMin?: number, delayMax?: number, postWait?: number } = {}) {
    const { delayMin = 40, delayMax = 100, postWait = 2000 } = options;
    
    // Đảm bảo tập trung vào ô nhập liệu
    await element.click({ force: true });
    await page.waitForTimeout(500);

    // Gõ từng phím với độ trễ ngẫu nhiên
    await page.keyboard.type(text, { 
        delay: Math.floor(Math.random() * (delayMax - delayMin + 1)) + delayMin 
    });

    // Đợi sau khi gõ xong để UI kịp cập nhật (Emojis, Link preview...)
    if (postWait > 0) {
        await page.waitForTimeout(postWait);
    }
}

/**
 * 6. KIỂM TRA HOÀN TẤT CHIẾN DỊCH
 */
/**
 * 6. KIỂM TRA HOÀN TẤT CHIẾN DỊCH (Đã chuyển sang @fb-automation/utils)
 */
// Export lại để các file cũ trong worker không bị lỗi import
export { checkCampaignCompletion };
