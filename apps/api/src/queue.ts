import { Queue, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { AUTOMATION_CONFIG } from '@fb-automation/constants';
dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const automationQueue = new Queue('fb-automation-queue', { 
  connection,
  defaultJobOptions: {
    attempts: AUTOMATION_CONFIG.MAX_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: 10000, 
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});

export async function addAutomationJob(name: string, data: Record<string, any>, opts?: JobsOptions) {
  return automationQueue.add(name, data, opts);
}
