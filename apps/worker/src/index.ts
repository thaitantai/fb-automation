import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@fb-automation/database';
import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';

dotenv.config();
chromium.use(stealth());

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const worker = new Worker(
  'fb-automation-queue',
  async (job) => {
    console.log(`Bắt đầu xử lý Job ${job.id} - Loại: ${job.name}`);
    const { accountId, target, content } = job.data;
    
    // Test playwright stealth mode
    const browser = await chromium.launch({ headless: process.env.NODE_ENV === 'production' });
    try {
      const page = await browser.newPage();
      await page.goto('https://bot.splaybow.com/');
      console.log(`[Worker] Khởi tạo Playwright thành công cho account: ${accountId || 'TestAccount'}`);
      
      // Update Job status in DB
      if (job.data.campaignId) {
        await prisma.campaign.update({
          where: { id: job.data.campaignId },
          data: { status: 'COMPLETED' }
        });
      }
    } catch (error) {
      console.error(`[Worker Error] ${error}`);
      
      if (job.data.campaignId) {
        await prisma.campaign.update({
          where: { id: job.data.campaignId },
          data: { status: 'FAILED' }
        });
      }
      throw error;
    } finally {
      await browser.close();
    }
  },
  { connection, concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2') }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} đã hoàn thành xuất sắc`);
});

worker.on('failed', (job, err) => {
  if (job) {
    console.error(`Job ${job.id} gặp lỗi:`, err.message);
  }
});

console.log('Worker đã khởi động và đang chờ Queue trên Redis...');
