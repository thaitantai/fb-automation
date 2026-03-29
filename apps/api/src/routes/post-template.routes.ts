import { Router } from 'express';
import { PostTemplateController } from '../controllers/post-template.controller';
import { protectRoute } from '../middlewares/auth.middleware';

const router = Router();
const controller = new PostTemplateController();

// Đảm bảo bảo mật cho các thao tác về bài viết
router.use(protectRoute);

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.patch('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
