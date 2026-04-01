import { Page } from 'playwright';
import { prisma } from '@fb-automation/database';
import { FB_SELECTORS } from '@fb-automation/constants';

/**
 * Kiểm tra trạng thái đăng nhập thực tế của Facebook bằng cách quét giao diện
 * Kết hợp cả kiểm tra Cookies và kiểm tra Selector UI
 * Nếu fail: Tự động xóa Session và cập nhật status thành DISCONNECTED trong Database
 */
export async function verifyLoginStatus(
    page: Page, 
    accountId?: string, 
    jobId?: string,
    shouldUpdateDb: boolean = false
): Promise<boolean> {
    const logPrefix = jobId ? `[Job:${jobId}] ` : '';
    console.log(`${logPrefix}🔐 Đang xác thực trạng thái phiên...`);

    // 1. Kiểm tra nhanh bằng Cookies
    const cookies = await page.context().cookies();
    const hasCUser = cookies.some(c => c.name === 'c_user');
    
    // 2. Kiểm tra sâu bằng UI Selectors (Để xác nhận SỐNG ngay lập tức)
    const loggedInSelectors = FB_SELECTORS.AUTH.LOGGED_IN_INDICATORS;

    for (const sel of loggedInSelectors) {
        try {
            if (await page.locator(sel).isVisible({ timeout: 5000 })) {
                console.log(`${logPrefix}✅ Xác nhận: Phiên đăng nhập đang hoạt động.`);
                return true;
            }
        } catch (e) {}
    }

    // 3. Kiểm tra xem có đang ở trang login/checkpoint không
    const url = page.url();
    const isAtLoginOrError = !hasCUser || 
                             url.includes('login.php') || 
                             url.includes('checkpoint') || 
                             url.includes('error') || 
                             url.includes('/reg/');

    if (isAtLoginOrError) {
        console.log(`${logPrefix}❌ XÁC THỰC THẤT BẠI tại: ${url}`);
        
        // CẬP NHẬT DATABASE: Xóa Session và báo DISCONNECTED (Chỉ thực hiện nếu được yêu cầu)
        if (shouldUpdateDb && accountId) {
            console.log(`${logPrefix}💾 Đang cập nhật Database (DISCONNECTED)...`);
            await prisma.fbAccount.update({
                where: { id: accountId },
                data: { sessionData: null, status: 'DISCONNECTED' }
            }).catch(err => console.error(`${logPrefix}🔴 Lỗi DB: ${err.message}`));
        }
        
        return false;
    }

    // CHỐT CUỐI: Nếu có Cookie c_user và không ở trang Login/Checkpoint thì coi như SỐNG
    console.log(`${logPrefix}✅ Xác nhận: Có Cookie tín hiệu và không bị chặn. Tiếp tục...`);
    return true;
}
