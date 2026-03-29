import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';
import authRoutes from './auth.route';
import accountRoutes from './account.route';
import groupRoutes from './group.routes';
import postTemplateRoutes from './post-template.routes';
import campaignRoutes from './campaign.routes';

const router = Router();

// Health check route
router.get('/health', checkHealth);

// Authentication routes
router.use('/auth', authRoutes);

// Facebook Account routes
router.use('/fb-accounts', accountRoutes);

// Facebook Group routes
router.use('/fb-groups', groupRoutes);

// Post Template routes
router.use('/post-templates', postTemplateRoutes);

// Campaign routes
router.use('/campaigns', campaignRoutes);

export default router;
