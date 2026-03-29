import { Job } from 'bullmq';
import { Page, BrowserContext } from 'playwright';
import { prisma } from '@fb-automation/database';
import { FB_SELECTORS } from '@fb-automation/constants';
import { browserDriver } from '../../drivers/browser';
import { JobDefinition } from '../types';

/**
 * --- PHẦN 1: CÁC TIỆN ÍCH (HELPERS) ---
 */

/** Kiểm tra xem trang hiện tại có đang hiển thị CAPTCHA thực sự không */
async function checkCaptcha(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    const hasBotKeyword = text.includes('người máy') || text.includes('robot') || text.includes('captcha');
    const hasCaptchaImg = !!document.querySelector('img[src*="captcha"]');
    const hasIframe = !!document.querySelector('iframe');
    return hasBotKeyword && (hasCaptchaImg || hasIframe || text.includes('xác minh'));
  });
}

/** Thực hiện điền thông tin đăng nhập từ Job Data */
async function performLogin(page: Page, data: any) {
  await page.waitForSelector(FB_SELECTORS.LOGIN.EMAIL_INPUT, { timeout: 10000 });
  
  // Chấp nhận Cookie Banner nếu có
  const cookieBtn = page.getByRole('button', { name: /Allow all cookies|Accept All|Cho phép tất cả/i });
  if (await cookieBtn.isVisible()) {
    await cookieBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  await page.locator(FB_SELECTORS.LOGIN.EMAIL_INPUT).first().fill(data.username);
  await page.waitForTimeout(500);
  await page.locator(FB_SELECTORS.LOGIN.PASSWORD_INPUT).first().fill(data.password);
  await page.waitForTimeout(1000);
  
  await page.locator(FB_SELECTORS.LOGIN.LOGIN_BUTTON).first().click({ force: true });
}

/** Vòng lặp chờ giải tay trong 2 phút */
async function handleManualIntervention(page: Page, context: BrowserContext, jobId: string) {
  const timeoutMs = 120000;
  let elapsed = 0;

  while (elapsed < timeoutMs) {
    await page.waitForTimeout(5000);
    elapsed += 5000;

    const loopCookies = await context.cookies();
    // Chờ thấy c_user xuất hiện
    if (loopCookies.some(c => c.name === 'c_user')) {
      console.log(`[Job:${jobId}] ✅ Đã thấy Login Cookie (c_user). Đang đợi 3s để ổn định phiên...`);
      await page.waitForTimeout(3000);
      return true;
    }

    if (elapsed % 15000 === 0) {
      const url = page.url();
      console.log(`[Job:${jobId}] Đợi giải tay (${elapsed / 1000}s/120s) | URL: ${url}`);
    }
  }
  return false;
}

/** Cập nhật kết quả cuối cùng vào Database (Xử lý cả Gộp tài khoản nếu cần) */
async function finalizeAccountData(accountId: string, finalCookies: any[], originalData: any) {
  const fbUid = finalCookies.find(c => c.name === 'c_user')?.value;
  
  if (!fbUid) {
    const cookieNames = finalCookies.map(c => c.name).join(', ');
    console.warn(`[Finalize] Lỗi lấy UID. Danh sách Cookies: [${cookieNames}]`);
    throw new Error('Đặc biệt: Không lấy được UID (c_user) từ trình duyệt dù đã vượt qua bước chờ.');
  }

  const sessionData = JSON.stringify(finalCookies);
  const existingAccount = await prisma.fbAccount.findUnique({ where: { fbUid } });

  if (existingAccount && existingAccount.id !== accountId) {
    // Tài khoản đã có sẵn trọng hệ thống -> Gộp dữ liệu
    await prisma.$transaction([
      prisma.fbAccount.update({
        where: { id: existingAccount.id },
        data: { 
          sessionData, 
          status: 'ACTIVE', 
          lastLogin: new Date(),
          userId: originalData.userId,
          username: originalData.username,
          password: originalData.password
        }
      }),
      prisma.fbAccount.delete({ where: { id: accountId } })
    ]);
  } else {
    // Cập nhật tài khoản hiện tại
    await prisma.fbAccount.update({
      where: { id: accountId },
      data: { fbUid, sessionData, status: 'ACTIVE', lastLogin: new Date() }
    });
  }
}

/**
 * Thử nạp Cookie ngầm (Headless) bằng logic "Săn Cookies" siêu tốc
 * Chỉ cần thấy c_user là thoát ngay, không đợi nạp rác (ảnh, tracking...)
 */
async function trySilentCookieLogin(accountId: string) {
  const account = await prisma.fbAccount.findUnique({ where: { id: accountId } });
  
  if (!account?.sessionData || account.sessionData.includes('PENDING')) {
    console.log(`[SilentCheck] ${account?.username || accountId}: Bỏ qua (Chưa có Cookies).`);
    return null;
  }

  // Khởi tạo trình duyệt ẩn (Headless)
  const { browser, context } = await browserDriver.launch({ headless: true });
  try {
    console.log(`[SilentCheck] 🚀 Bắt đầu săn tìm tín hiệu sống: ${account.username}...`);
    await context.addCookies(JSON.parse(account.sessionData));
    const page = await context.newPage();
    
    // Mở Facebook và chỉ đợi cho đến khi phản hồi HTML bắt đầu (commit)
    // Sẽ nhanh gấp 5-10 lần so với nạp toàn bộ trang
    await page.goto('https://m.facebook.com/', { waitUntil: 'commit', timeout: 30000 }).catch(() => {});

    // Vòng lặp Săn Cookies: Quét mỗi giây
    for (let i = 1; i <= 15; i++) {
       await page.waitForTimeout(1000); // Đợi 1s
       
       const cookies = await context.cookies();
       const isLoggedIn = cookies.some(c => c.name === 'c_user');
       const url = page.url();
       const isAtLogin = url.includes('login.php') || url.includes('checkpoint') || url.includes('error');

       // KẾT QUẢ 1: Thành công rực rỡ (Cookies sống & đúng trang đích)
       if (isLoggedIn && !isAtLogin) {
          console.log(`[SilentCheck] ✅ ĐÃ TÌM THẤY! Cookies SỐNG sau ${i} giây săn tìm.`);
          return cookies; // Trả về để cập nhật Database và đóng browser ngay
       }

       // KẾT QUẢ 2: Bi thảm (Bị Facebook đuổi ra trang Login/Checkpoint)
       if (isAtLogin) {
          console.log(`[SilentCheck] ❌ Cookies CHẾT: Đã bị redirected về ${url}`);
          return null; // Cookie đã bị thu hồi/invalidated
       }
       
       if (i % 5 === 0) console.log(`[SilentCheck] Đang rình rập... (${i}s/15s)`);
    }

    console.warn(`[SilentCheck] ⚠️ Hết 15s vẫn chưa thấy tín hiệu đăng nhập.`);
    return null;

  } catch (e: any) {
    console.error(`[SilentCheck] 🔴 Lỗi ngầm: ${e.message}`);
    return null;
  } finally {
    // Đảm bảo đóng browser để giải phóng RAM ngay lập tức
    await browser.close();
  }
}

/**
 * --- PHẦN 2: LUỒNG XỬ LÝ CHÍNH (MAIN HANDLER) ---
 */

const handler = async (job: Job) => {
  const { accountId, username, password, userId } = job.data;

  // 1. Kiểm tra xác thực ngầm siêu tốc (Cookie Hunting)
  const silentCookies = await trySilentCookieLogin(accountId);
  if (silentCookies) {
    await finalizeAccountData(accountId, silentCookies, { userId, username, password });
    console.log(`[Job:${job.id}] ✅ TRUY CẬP THÀNH CÔNG (Silent).`);
    return;
  }

  // 2. Nếu check ngầm thất bại -> Mở trình duyệt thật cho bạn thao tác
  console.warn(`[Job:${job.id}] ⚠️ Đang mở trình duyệt đăng nhập thủ công...`);
  const { browser, context } = await browserDriver.launch({ headless: false });

  try {
    const page = await context.newPage();
    await page.goto('https://m.facebook.com/', { waitUntil: 'networkidle' });

    // Kiểm tra CAPTCHA sơ bộ trang chủ
    if (await checkCaptcha(page)) {
      console.warn(`[Job:${job.id}] 🛑 Dính CAPTCHA trang chủ. Hãy giải tay...`);
      // Vẫn tiếp tục để bạn giải tay
    }

    // Tự động điền (nếu trang có sẵn ô nhập)
    const hasEmailInput = await page.locator(FB_SELECTORS.LOGIN.EMAIL_INPUT).isVisible().catch(() => false);
    if (hasEmailInput) {
      console.log(`[Job:${job.id}] Đang điền Credential...`);
      await performLogin(page, { username, password });
      await page.waitForTimeout(10000); // Đợi FB xử lý redirect
    }

    // Kiểm tra hậu đăng nhập (Đợi giải tay)
    let finalCookies = await context.cookies();
    let isLoggedIn = finalCookies.some(c => c.name === 'c_user');

    if (!isLoggedIn) {
      const hasPasswordField = await page.locator(FB_SELECTORS.LOGIN.PASSWORD_INPUT).isVisible().catch(() => false);

      // Nếu không còn ô nhập pass mà chưa login thành công -> Chắc chắn đang bị kẹt Checkpoint/Captcha
      if (!hasPasswordField) {
        console.warn(`[Job:${job.id}] 🛑 PHÁT HIỆN YÊU CẦU XÁC THỰC. HÃY GIẢI TRÊN TRÌNH DUYỆT TRONG 2 PHÚT...`);
        isLoggedIn = await handleManualIntervention(page, context, job.id!);
        if (!isLoggedIn) throw new Error('STOP_BY_MANUAL_TIMEOUT');
      } else {
        throw new Error('Sai thông tin hoặc Facebook bắt nhập lại thủ công.');
      }
    }

    // 3. Hoàn tất lưu dữ liệu
    const latestCookies = await context.cookies();
    await finalizeAccountData(accountId, latestCookies, { userId, username, password });
    console.log(`[Success] Tài khoản ${username} đã Sẵn sàng.`);

  } catch (error: any) {
    if (error.message.includes('STOP_BY')) {
      await prisma.fbAccount.update({ where: { id: accountId }, data: { status: 'CHECKPOINT' } }).catch(() => {});
    }
    console.error(`[Job:${job.id}] 🔴 Lỗi: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }
};

/** Xử lý khi Job thất bại hoàn toàn */
const onFinalFailed = async (job: Job) => {
  if (job.data?.accountId) {
    const acc = await prisma.fbAccount.findUnique({ where: { id: job.data.accountId } });
    if (acc && acc.status !== 'CHECKPOINT') {
      await prisma.fbAccount.update({ where: { id: job.data.accountId }, data: { status: 'ERROR' } });
    }
  }
};

export const loginAccountJob: JobDefinition = { handler, onFinalFailed };
