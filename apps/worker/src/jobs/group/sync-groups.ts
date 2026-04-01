import { Job } from 'bullmq';
import { Page } from 'playwright';
import { prisma } from '@fb-automation/database';
import { browserDriver } from '../../drivers/browser';
import { JobDefinition } from '../types';

/** 
 * --- PHẦN 1: CÁC TIỆN ÍCH TRÍCH XUẤT (EXTRACTORS) ---
 */

async function extractGroups(page: Page): Promise<{ groupId: string, name: string, privacy: string }[]> {
  return page.evaluate(() => {
    const results: { groupId: string, name: string, privacy: string }[] = [];
    const links = Array.from(document.querySelectorAll('a[href*="/groups/"]'));
    const seenIds = new Set<string>();

    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const match = href.match(/\/groups\/([^\/?#&]+)/);

      if (match && match[1]) {
        const id = match[1];
        const blacklist = ['create', 'discover', 'categories', 'invites', 'search', 'joined', 'membership', 'feed'];
        if (blacklist.includes(id.toLowerCase())) return;

        if (seenIds.has(id)) return;
        seenIds.add(id);

        let rawText = (link as any).innerText || link.textContent || '';
        let name = rawText.split('\n')[0].trim();

        const noiseKeywords = ["Lần hoạt động gần nhất:", "Last active:", "Gần đây có hoạt động", "đã tham gia", "Joined", "·"];
        noiseKeywords.forEach(kw => {
            if (name.includes(kw)) name = name.split(kw)[0].trim();
        });

        let privacy = 'UNKNOWN';
        if (rawText.toLowerCase().includes('công khai') || rawText.toLowerCase().includes('public')) privacy = 'PUBLIC';
        else if (rawText.toLowerCase().includes('riêng tư') || rawText.toLowerCase().includes('private')) privacy = 'PRIVATE';

        if (name.length > 2 && !['Groups', 'Nhóm', 'Xem tất cả', 'See all'].includes(name)) {
          results.push({ groupId: id, name, privacy });
        }
      }
    });
    return results;
  });
}

/** 
 * --- PHẦN 2: GIAO TIẾP DATABASE ---
 */

async function saveGroups(accountId: string, groups: any[], job: Job) {
  if (!groups.length) return;

  // Chia nhỏ mẻ lưu (Batch) để không gây nghẽn Connection của Prisma
  const BATCH_SIZE = 10;
  for (let i = 0; i < groups.length; i += BATCH_SIZE) {
    const batch = groups.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(g =>
        prisma.fbGroup.upsert({
          where: { fbAccountId_groupId: { fbAccountId: accountId, groupId: g.groupId } },
          create: { groupId: g.groupId, name: g.name, privacy: g.privacy, fbAccountId: accountId },
          update: { name: g.name, syncedAt: new Date() }
        })
      )
    );
    // Báo cáo tiến độ về Job Queue
    await job.updateProgress(Math.floor((i / groups.length) * 100));
  }
}

/** 
 * --- PHẦN 3: XỬ LÝ CHÍNH ---
 */

const handler = async (job: Job) => {
  const { accountId } = job.data;
  const account = await prisma.fbAccount.findUnique({ where: { id: accountId } });
  
  if (!account || !account.sessionData) throw new Error('Session expired.');

  // TỐI ƯU 1: Chạy Headless để tiết kiệm tài nguyên CPU/RAM
  const { browser, context } = await browserDriver.launch({ headless: true });

  try {
    const page = await context.newPage();

    // TỐI ƯU 2: Block hình ảnh & Font để tăng tốc tải trang 300%
    await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2}', route => route.abort());

    await context.addCookies(JSON.parse(account.sessionData));

    console.log(`[Job:${job.id}] 🚀 Đang đồng bộ thông minh cho ${account.username}...`);
    
    await page.goto('https://www.facebook.com/groups/joins/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    let lastCount = 0;
    let stableRetries = 0;
    const MAX_GROUPS = 2000; // Giới hạn an toàn

    // TỐI ƯU 3: Smart Scroll cho đến khi hết danh sách
    for (let scroll = 0; scroll < 20; scroll++) {
      const currentGroups = await extractGroups(page);
      
      console.log(`[Job:${job.id}] 🔄 Đã tìm thấy ${currentGroups.length} nhóm...`);
      
      if (currentGroups.length === lastCount) {
        stableRetries++;
      } else {
        stableRetries = 0;
        lastCount = currentGroups.length;
      }

      // Nếu không tìm thấy thêm nhóm mới sau 2 lần cuộn, dừng lại
      if (stableRetries >= 2 || currentGroups.length >= MAX_GROUPS) break;

      await page.evaluate(() => window.scrollBy(0, 1500));
      await page.waitForTimeout(2000);
      
      // Update trạng thái cho job (để frontend có thể hiển thị nếu cần)
      await job.updateProgress({ found: currentGroups.length });
    }

    const finalGroups = await extractGroups(page);
    await saveGroups(accountId, finalGroups, job);

    const message = `✅ Đồng bộ hoàn tất! Tìm thấy ${finalGroups.length} nhóm.`;
    console.log(`[Job:${job.id}] ${message}`);

    return { success: true, count: finalGroups.length, message };

  } catch (error: any) {
    console.error(`[Job:${job.id}] 🔴 Lỗi: ${error.message}`);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};

export const syncGroupsJob: JobDefinition = { 
  handler, 
  onFinalFailed: async (job: Job) => console.error(`Job ${job.id} failed.`) 
};
