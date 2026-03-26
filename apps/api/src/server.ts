import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`🚀 API Server is running on port ${port}`);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Shutting down API server gracefully...');
  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
});
