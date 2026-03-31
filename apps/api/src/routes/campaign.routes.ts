import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { protectRoute } from '../middlewares/auth.middleware';

const router = Router();
const controller = new CampaignController();

// Đảm bảo bảo mật cho các thao tác về chiến dịch
router.use(protectRoute);

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id/logs', (req, res) => controller.getLogs(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.patch('/:id', (req, res) => controller.update(req, res));
router.patch('/:id/status', (req, res) => controller.updateStatus(req, res));
router.post('/test-protection', (req, res) => controller.testProtection(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
