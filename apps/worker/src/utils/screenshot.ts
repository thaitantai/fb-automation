import { Page } from 'playwright';
import path from 'path';
import fs from 'fs';

/**
 * Tiện ích chụp ảnh màn hình khi có lỗi để phục vụ việc Debug
 * @param page Đối tượng Page của Playwright
 * @param jobId ID của Job đang thực hiện
 * @returns Đường dẫn đến file ảnh đã chụp
 */
export async function captureErrorScreenshot(page: Page, jobId: string): Promise<string | undefined> {
    try {
        if (!page) return undefined;

        const ssDir = path.join(process.cwd(), 'tmp', 'screenshots');
        
        // Đảm bảo thư mục tồn tại
        if (!fs.existsSync(ssDir)) {
            fs.mkdirSync(ssDir, { recursive: true });
        }

        const fileName = `error_${jobId}_${Date.now()}.png`;
        const filePath = path.join(ssDir, fileName);

        await page.screenshot({ 
            path: filePath, 
            fullPage: true 
        });

        console.log(`[Screenshot] 📸 Đã chụp ảnh lỗi tại: ${filePath}`);
        return filePath;
    } catch (error: any) {
        console.error(`[Screenshot] 🔴 Không thể chụp ảnh màn hình: ${error.message}`);
        return undefined;
    }
}
