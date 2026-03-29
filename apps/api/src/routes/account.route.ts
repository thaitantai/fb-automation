import { Router } from 'express';
import * as controller from '../controllers/account.controller';
import { protectRoute } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả các route này yêu cầu đăng nhập (AuthMiddleware)
router.use(protectRoute);

router.post('/', controller.addFbAccount);
router.get('/', controller.getMyFbAccounts);
router.delete('/:id', controller.deleteFbAccount);
router.post('/bulk-delete', controller.bulkDeleteFbAccounts);
router.post('/:id/reconnect', controller.reconnectFbAccount);
router.post('/:id/disconnect', controller.disconnectFbAccount);

export default router;
