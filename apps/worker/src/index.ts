import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { AUTOMATION_CONFIG } from '@fb-automation/constants';
import { jobProcessor } from './core/processor'; // Import Job Processor
import { registerWorkerEvents } from './core/events'; // Import Event Manager

dotenv.config();

/**
 * Cấu hình Redis Connection cho Worker
 */
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

connection.on('connect', () => {
  console.log(`✅ Worker connected to Redis.`);
});

/**
 * Khởi tạo Worker
 */
const worker = new Worker(
  'fb-automation-queue',
  jobProcessor, // Truyền trực tiếp hàm xử lý trung tâm
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2'),
    lockDuration: AUTOMATION_CONFIG.LOCK_DURATION,
  }
);

// Đăng ký các sự kiện theo quy trình
registerWorkerEvents(worker);

console.log('🚀 [Worker] Hệ thống đã sẵn sàng với cấu trúc 100% Clean architecture!');


