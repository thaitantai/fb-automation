import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

export const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

connection.on('connect', () => {
  console.log(`✅ Redis shared connection established.`);
});
