import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { protectRoute } from '../middlewares/auth.middleware';

const router = Router();
const groupController = new GroupController();

// Tất cả các route về Group đều yêu cầu đăng nhập
router.use(protectRoute);

/**
 * @route   GET /api/fb-groups
 * @desc    Lấy danh sách nhóm (Hỗ trợ lọc theo accountIds qua query)
 */
router.get('/', (req, res) => groupController.getAllGroups(req, res));

/**
 * @route   GET /api/fb-groups/account/:accountId
 * @desc    Lấy nhóm của 1 tài khoản cụ thể (Legacy/Modal view)
 */
router.get('/account/:accountId', (req, res) => groupController.getAccountGroups(req, res));

/**
 * @route   POST /api/fb-groups/sync-bulk
 * @desc    Đồng bộ hàng loạt nhiều tài khoản
 */
router.post('/sync-bulk', (req, res) => groupController.syncBulkGroups(req, res));

/**
 * @route   GET /api/fb-groups/search
 * @desc    Tìm kiếm nhóm theo tên
 */
router.get('/search', (req, res) => groupController.searchGroups(req, res));

export default router;
