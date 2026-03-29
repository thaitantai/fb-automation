import { Worker, Job } from 'bullmq';
import { jobRegistry } from '../jobs'; // Import registry để lấy hook xử lý lỗi riêng

/**
 * Đăng ký tất cả các sự kiện của Worker tại đây
 */
export function registerWorkerEvents(worker: Worker) {
  
  worker.on('completed', (job: Job) => {
    console.log(`[Worker] ✅ Job ${job.id} [${job.name}] hoàn thành thành công.`);
  });

  worker.on('failed', async (job: Job | undefined, err: Error) => {
    if (!job) return;
    
    console.error(`[Worker] ❌ Job ${job.id} [${job.name}] thất bại (Lần ${job.attemptsMade}/${job.opts.attempts}):`, err.message);
    
    // Logic: Chỉ thực thi xử lý lỗi cuối cùng nếu đã xài hết số lần retry
    if (job.attemptsMade >= (job.opts.attempts || 1)) {
        const definition = jobRegistry[job.name];
        
        if (definition?.onFinalFailed) {
            console.log(`[Worker] ⚡ Đang thực thi xử lý lỗi riêng biệt cho Job: ${job.name}`);
            await definition.onFinalFailed(job).catch(e => console.error(`[Worker] ❌ Lỗi khi chạy onFinalFailed cho ${job.name}:`, e.message));
        }
    }
  });

  worker.on('stalled', (jobId: string) => {
    console.warn(`[Worker] 🐢 Cảnh báo: Job ${jobId} đang bị treo (Stalled). Nó sẽ được retry.`);
  });
}
