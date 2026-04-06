import { Job } from 'bullmq';
import { AUTOMATION_CONFIG } from '@fb-automation/constants';
import { jobRegistry } from '../jobs';
import { connection } from './redis';

/**
 * Cơ chế Account Locking - Đảm bảo một tài khoản chỉ được thực hiện 1 Job tại một thời điểm.
 * Nếu tài khoản đang bận, Job sẽ được delay và đưa ngược lại vào hàng đợi.
 */
async function acquireAccountLock(accountId: string, jobId: string) {
  const lockKey = `lock:account:${accountId}`;
  
  // Thử xác lập khóa trong Redis với thời hạntự động hủy (TTL) 10 phút để tránh bị kẹt nếu sập server
  const success = await connection.set(lockKey, jobId, 'NX', 'PX', 10 * 60 * 1000);
  return success === 'OK';
}

async function releaseAccountLock(accountId: string, jobId: string) {
  const lockKey = `lock:account:${accountId}`;
  const currentOwner = await connection.get(lockKey);
  
  // Chỉ xóa nếu mình là chủ nhân của khóa đó
  if (currentOwner === jobId) {
    await connection.del(lockKey);
  }
}

export async function jobProcessor(job: Job) {
  const { accountId } = job.data;

  // Nếu Job có liên quan đến tài khoản, thực hiện kiểm tra khóa
  if (accountId) {
    const isLocked = await acquireAccountLock(accountId, job.id!);
    
    if (!isLocked) {
      console.warn(`[Lock] 🚨 Tài khoản ${accountId} đang bận xử lý Job khác. Đang trả Job ${job.id} về hàng đợi...`);
      // Đưa Job ngược lại hàng đợi với độ trễ 30 giây để thử lại
      await job.moveToFailed(new Error('ACCOUNT_BUSY'), 'ACCOUNT_BUSY');
      // Thêm flag để BullMQ có thể retry Job này
      return; 
    }
  }

  console.log(`[Worker] 🛠️ Đang xử lý Job ID: ${job.id} - Loại: ${job.name} cho Acc: ${accountId || 'N/A'}`);

  const definition = jobRegistry[job.name];
  if (!definition) throw new Error(`Job Type ${job.name} not supported.`);

  const { handler } = definition;
  const jobTimeout = definition.timeout || AUTOMATION_CONFIG.JOB_TIMEOUT;

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`TIMEOUT: Job ${job.id} (${job.name}) vượt quá ${jobTimeout}ms`));
    }, jobTimeout);
  });

  try {
    const result = await Promise.race([handler(job), timeoutPromise]);
    return result;
  } catch (error: any) {
    console.error(`[Worker] ❌ Lỗi xử lý Job ${job.id}:`, error.message);
    throw error;
  } finally {
    // Luôn luôn giải phóng khóa sau khi xong việc (thành công hoặc thất bại)
    if (accountId) {
      await releaseAccountLock(accountId, job.id!);
      console.log(`[Lock] 🔓 Đã giải phóng tài khoản ${accountId}`);
    }
  }
}
