import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';

const app: Express = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core Routing
app.use('/api/v1', routes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error Middleware]', err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

export default app;
