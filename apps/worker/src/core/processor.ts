import { Job } from 'bullmq';
import { AUTOMATION_CONFIG } from '@fb-automation/constants';
import { jobRegistry } from '../jobs';

/**
 * Hàm xử lý chính cho từng Job
 * Quản lý Timeout, Registry lookup và Error handling
 */
export async function jobProcessor(job: Job) {
  console.log(`[Worker] 🛠️ Đang xử lý Job ID: ${job.id} - Loại: ${job.name}`);

  const definition = jobRegistry[job.name];

  if (!definition) {
    console.warn(`[Worker] ⚠️ Không tìm thấy handler cho Job: ${job.name}`);
    throw new Error(`Job Type ${job.name} not supported.`);
  }

  const { handler } = definition;

  // Tạo Promise Timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`TIMEOUT: Job ${job.id} (${job.name}) vượt quá ${AUTOMATION_CONFIG.JOB_TIMEOUT}ms`));
    }, AUTOMATION_CONFIG.JOB_TIMEOUT);
  });

  try {
    // Đua tốc độ giữa logic thực tế và Timeout
    return await Promise.race([handler(job), timeoutPromise]);
  } catch (error: any) {
    console.error(`[Worker] ❌ Lỗi xử lý Job ${job.id}:`, error.message);
    throw error;
  }
}
