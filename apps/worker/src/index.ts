import { Worker } from 'bullmq';
import { AUTOMATION_CONFIG } from '@fb-automation/constants';
import { jobProcessor } from './core/processor'; 
import { registerWorkerEvents } from './core/events';
import { connection } from './core/redis';

/**
 * Khởi tạo Worker với shared connection
 */
const worker = new Worker(
  'fb-automation-queue',
  jobProcessor,
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2'),
    lockDuration: AUTOMATION_CONFIG.LOCK_DURATION,
  }
);

// Đăng ký các sự kiện theo quy trình
registerWorkerEvents(worker);

console.log('🚀 [Worker] Hệ thống đã sẵn sàng với cơ chế Account Safety!');
