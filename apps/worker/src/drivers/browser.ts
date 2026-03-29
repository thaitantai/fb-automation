import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';

// Kích hoạt plugin stealth để tránh bị phát hiện
chromium.use(stealth());

export const browserDriver = {
  /**
   * Khởi tạo trình duyệt với cấu hình mặc định hoặc proxy
   */
  async launch(options: { headless?: boolean; proxy?: string; desktop?: boolean } = {}) {
    const launchOptions: any = {
      headless: options.headless ?? false, // Mặc định hiển thị để debug dễ dàng hơn
      slowMo: 100, 
    };

    if (options.proxy) {
      launchOptions.proxy = { server: options.proxy };
    }

    const browser = await chromium.launch(launchOptions);
    
    // Cấu hình linh hoạt giữa Mobile và Desktop (Antib-Ban)
    const contextOptions: any = options.desktop ? {
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    } : {
      viewport: { width: 390, height: 844 }, // iPhone profile
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    };

    const context = await browser.newContext({
      ...contextOptions,
      locale: 'vi-VN',
      timezoneId: 'Asia/Ho_Chi_Minh',
      geolocation: { longitude: 105.83416, latitude: 21.027764 },
      permissions: ['geolocation']
    });

    return { browser, context };
  }
};
