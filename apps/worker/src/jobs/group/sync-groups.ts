import { Job } from 'bullmq';
import { Page, Response } from 'playwright';
import { prisma } from '@fb-automation/database';
import { browserDriver } from '../../drivers/browser';
import { JobDefinition } from '../types';

/**
 * --- CONFIGURATION & CONSTANTS ---
 */
const SYNC_CONFIG = {
  MAX_GROUPS: 15000,
  MAX_SCROLLS: 300,
  BATCH_SIZE_DB: 15,
  STREAM_THRESHOLD: 50,
  FB_GROUPS_URL: 'https://www.facebook.com/groups/joins/',
  BLACKLIST_IDS: ['create', 'discover', 'categories', 'invites', 'search', 'joined', 'membership', 'feed', 'groups', 'joins'],
  JUNK_NAMES: ['Groups', 'Nhóm', 'Xem tất cả', 'See all', 'Tham gia', 'Join', 'Group', 'Joined', 'Đã tham gia'],
};

interface GroupResult {
  groupId: string;
  name: string;
  privacy: string;
}

/**
 * --- DB HELPERS ---
 */
async function saveGroupsBatch(accountId: string, groups: GroupResult[], job: Job) {
  if (!groups.length) return;

  for (let i = 0; i < groups.length; i += SYNC_CONFIG.BATCH_SIZE_DB) {
    const batch = groups.slice(i, i + SYNC_CONFIG.BATCH_SIZE_DB);
    await Promise.all(
      batch.map(g =>
        prisma.fbGroup.upsert({
          where: { fbAccountId_groupId: { fbAccountId: accountId, groupId: g.groupId } },
          create: { groupId: g.groupId, name: g.name, privacy: g.privacy, fbAccountId: accountId },
          update: { name: g.name, syncedAt: new Date() }
        })
      )
    );
    await job.updateProgress({ status: 'SAVING_DATABASE', current: i, total: groups.length });
  }
}

/**
 * --- DOM EXTRACTION ---
 */
async function extractGroupsFromDOM(page: Page, knownIds: string[]): Promise<GroupResult[]> {
  return page.evaluate(({ knownList, blacklist, junkNames }) => {
    const results: GroupResult[] = [];
    const elements = Array.from(document.querySelectorAll('a[href*="/groups/"]'));
    const seenIds = new Set<string>(knownList);

    elements.forEach(el => {
      const href = (el as HTMLAnchorElement).href || '';
      const match = href.match(/\/groups\/([0-9a-zA-Z\.]+)(?:\/|\?|$)/);

      if (match && match[1]) {
        const id = match[1];
        if (blacklist.includes(id.toLowerCase())) return;
        if (seenIds.has(id)) return;
        seenIds.add(id);

        let name = (el as HTMLElement).innerText || el.textContent || '';
        if (name.trim().length <= 1) {
          const parent = el.closest('div[role="listitem"]') || el.parentElement;
          if (parent) name = (parent as HTMLElement).innerText || '';
        }

        // Filter suggested/unjoined groups
        const listContainer = el.closest('div[role="listitem"]');
        const hasJoinButton = listContainer ? Array.from(listContainer.querySelectorAll('div[role="button"]')).some(b => {
          const text = (b as HTMLElement).innerText?.trim().toLowerCase();
          return text === 'tham gia' || text === 'join';
        }) : false;

        if (hasJoinButton) return;

        const lines = name.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return;

        let cleanName = lines[0];
        const noiseKeywords = ["Lần hoạt động gần nhất:", "Last active:", "Gần đây có hoạt động", "đã tham gia", "Joined", "·", "Thành viên", "members", "nhóm", "Group", "(", ")"];
        noiseKeywords.forEach(kw => {
          if (cleanName.includes(kw)) cleanName = cleanName.split(kw)[0].trim();
        });
        cleanName = cleanName.replace(/^[\s·•]+|[\s·•]+$/g, '').trim();

        let privacy = 'UNKNOWN';
        const fullTextLower = name.toLowerCase();
        if (fullTextLower.includes('công khai') || fullTextLower.includes('public')) privacy = 'PUBLIC';
        else if (fullTextLower.includes('riêng tư') || fullTextLower.includes('private')) privacy = 'PRIVATE';

        if (cleanName.length > 1 && !junkNames.includes(cleanName)) {
          results.push({ groupId: id, name: cleanName, privacy });
        }
      }
    });

    // Handle "See More" button if present
    const seeMoreButtons = Array.from(document.querySelectorAll('div[role="button"]'))
      .filter(btn => {
        const txt = (btn as HTMLElement).innerText?.toLowerCase() || '';
        return txt.includes('xem thêm') || txt.includes('show more') || txt.includes('see more');
      });
    if (seeMoreButtons.length > 0) (seeMoreButtons[0] as HTMLElement).click();

    return results;
  }, { knownList: knownIds, blacklist: SYNC_CONFIG.BLACKLIST_IDS, junkNames: SYNC_CONFIG.JUNK_NAMES });
}

/**
 * --- NETWORK SNIFFING ---
 */
function setupNetworkSniffer(page: Page, groupMap: Map<string, GroupResult>, jobId: string) {
  page.on('response', async (response: Response) => {
    if (response.url().includes('/api/graphql/') && response.request().method() === 'POST') {
      try {
        const body = await response.text();
        const cleanBody = body.replace(/^for\s*\(\s*;\s*;\s*\)\s*;\s*/, '');

        if (cleanBody.includes('__typename":"Group"') || cleanBody.includes('groups_tab')) {
          const hunt = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) return obj.forEach(hunt);

            if ((obj.__typename === 'Group' || (obj.url && obj.url.includes('/groups/'))) && obj.id) {
              let id = obj.id;
              if (obj.url) {
                const match = obj.url.match(/\/groups\/([0-9a-zA-Z\.]+)/);
                if (match && match[1] && !isNaN(Number(match[1]))) id = match[1];
              }

              // Membership check
              const joinState = (obj.viewer_forum_join_state || obj.viewer_group_membership_state || obj.viewer_group_join_state || obj.viewer_join_state || obj.membership_status || '').toUpperCase();
              const isJoined = !['CAN_JOIN', 'REQUESTED', 'CAN_REQUEST'].includes(joinState) && (joinState.includes('JOIN') || ['ADMIN', 'MEMBER', 'MODERATOR'].includes(joinState) || joinState === '');

              if (id && id.length > 5 && isJoined && !groupMap.has(id)) {
                let privacy = 'UNKNOWN';
                const strObj = JSON.stringify(obj).toUpperCase();
                if (strObj.includes('PUBLIC')) privacy = 'PUBLIC';
                else if (strObj.includes('PRIVATE')) privacy = 'PRIVATE';

                groupMap.set(id, { groupId: id, name: obj.name || obj.short_name || 'Group from API', privacy });
              }
            }
            Object.values(obj).forEach(hunt);
          };

          cleanBody.split('\n').filter(l => l.trim()).forEach(line => {
            try { hunt(JSON.parse(line)); } catch { }
          });
        }
      } catch { }
    }
  });
}

/**
 * --- MAIN HANDLER ---
 */
const handler = async (job: Job) => {
  const startTime = Date.now();
  const { accountId } = job.data;
  const account = await prisma.fbAccount.findUnique({ where: { id: accountId } });
  if (!account || !account.sessionData) throw new Error('Session expired or account not found.');

  const { browser, context } = await browserDriver.launch({ headless: true });
  const allGroups = new Map<string, GroupResult>();
  let lastSavedCount = 0;

  try {
    const page = await context.newPage();
    
    // Resource blocking for speed
    await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,css}', (route, req) => {
      if (req.resourceType() === 'stylesheet' && req.url().includes('primary')) return route.continue();
      return route.abort();
    });

    setupNetworkSniffer(page, allGroups, job.id!);

    await context.addCookies(JSON.parse(account.sessionData));
    console.log(`[Job:${job.id}] 🚀 Starting sync for: ${account.username}`);

    await page.goto(SYNC_CONFIG.FB_GROUPS_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(4000 + Math.random() * 4000);

    let stableRetries = 0;

    for (let scroll = 0; scroll < SYNC_CONFIG.MAX_SCROLLS; scroll++) {
      const domGroups = await extractGroupsFromDOM(page, Array.from(allGroups.keys()));
      domGroups.forEach(g => !allGroups.has(g.groupId) && allGroups.set(g.groupId, g));

      console.log(`[Job:${job.id}] 🔄 Progress: ${allGroups.size} groups (Scroll ${scroll + 1})`);

      // Update BullMQ Progress
      await job.updateProgress({ status: 'SCANNING', found: allGroups.size, scroll: scroll + 1 });

      // Dynamic Streaming to DB
      if (allGroups.size - lastSavedCount >= SYNC_CONFIG.STREAM_THRESHOLD) {
        const toSave = Array.from(allGroups.values()).slice(lastSavedCount);
        lastSavedCount = allGroups.size;
        saveGroupsBatch(accountId, toSave, job).catch(e => console.error(`[StreamDB Error]`, e));
      }

      // Smart Stop Logic
      const currentCount = allGroups.size;
      if (currentCount === lastSavedCount && scroll > 5) stableRetries++; else stableRetries = 0;

      if (stableRetries >= 3) {
        const isStillLoading = await page.evaluate(() => {
          const main = document.querySelector('div[role="main"]');
          const spinners = main?.querySelectorAll('div[role="progressbar"], svg[aria-valuetext], .loading_spinner');
          if (!spinners || spinners.length === 0) return false;
          const rect = spinners[spinners.length - 1].getBoundingClientRect();
          return rect.top < window.innerHeight + 1000;
        });

        if (isStillLoading && stableRetries < 6) {
          await page.waitForTimeout(4000);
        } else if (stableRetries >= 6) {
          console.log(`[Job:${job.id}] 🚀 Mega-scroll final check...`);
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(4000);
          const finalDom = await extractGroupsFromDOM(page, Array.from(allGroups.keys()));
          finalDom.forEach(g => allGroups.set(g.groupId, g));
          if (allGroups.size === currentCount) break;
          stableRetries = 0;
        }
      }

      if (allGroups.size >= SYNC_CONFIG.MAX_GROUPS) break;

      // Aggressive scroll to trigger lazy loading
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));
      await page.waitForTimeout(1000 + Math.random() * 2000);
    }

    // Final database flush
    const finalGroups = Array.from(allGroups.values());
    const remaining = finalGroups.slice(lastSavedCount);
    if (remaining.length > 0) await saveGroupsBatch(accountId, remaining, job);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const message = `✅ Success! Synced ${finalGroups.length} groups for ${account.username} in ${duration}s.`;
    console.log(message);
    return { success: true, count: finalGroups.length, duration, message };

  } catch (error: any) {
    console.error(`[Job:${job.id}] 🔴 Error: ${error.message}`);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};

export const syncGroupsJob: JobDefinition = {
  handler,
  timeout: 900000,
  onFinalFailed: async (job: Job) => console.error(`[SYNC_FAILURE] Job ${job.id} failed after retries.`)
};
