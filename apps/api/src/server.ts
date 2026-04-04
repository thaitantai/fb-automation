import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { automationQueue } from './queue';

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`🚀 API Server is running on port ${port}`);

  // Tự động lên lịch robot kiểm tra bài duyệt bài mỗi tiếng
  automationQueue.add('VERIFY_GROUP_POST', {}, {
    repeat: { pattern: '0 * * * *' }, // Chạy vào đầu mỗi giờ
    jobId: 'verify-group-post-scheduled'
  }).catch(err => console.error('Failed to schedule verify job:', err));
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Shutting down API server gracefully...');
  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
});
