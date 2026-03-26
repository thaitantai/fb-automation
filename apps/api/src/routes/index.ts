import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';
import authRoutes from './auth.route';

const router = Router();

// Health check route
router.get('/health', checkHealth);

// Authentication routes
router.use('/auth', authRoutes);

export default router;
