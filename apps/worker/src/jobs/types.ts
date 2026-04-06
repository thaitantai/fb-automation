import { Job } from 'bullmq';

export type JobHandler = (job: Job) => Promise<any>;

/**
 * Cấu trúc chuẩn cho một Job: Gồm logic chạy và logic xử lý lỗi cuối cùng
 */
export interface JobDefinition {
  handler: JobHandler;
  onFinalFailed?: (job: Job) => Promise<void>;
  /**
   * Thời gian timeout riêng cho Job này (ms). 
   * Nếu không có sẽ dùng mặc định từ AUTOMATION_CONFIG.JOB_TIMEOUT
   */
  timeout?: number; 
}
