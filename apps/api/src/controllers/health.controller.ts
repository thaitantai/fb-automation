import { Request, Response } from 'express';
import { prisma } from '@fb-automation/database';

export const checkHealth = async (req: Request, res: Response) => {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'API and Database are running perfectly.', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ status: 'error', error: String(error) });
  }
};
