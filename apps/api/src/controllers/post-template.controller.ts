import { Request, Response } from 'express';
import { prisma } from '@fb-automation/database';

export class PostTemplateController {
  /**
   * Lấy danh sách mẫu bài viết của User
   */
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const templates = await prisma.postTemplate.findMany({
        where: { userId },
        orderBy: { name: 'asc' }
      });
      return res.json({ data: templates });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Tạo mẫu bài viết mới
   */
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, contentSpintax, mediaUrls } = req.body;


      if (!name || !contentSpintax) {
        return res.status(400).json({ message: 'Tên và nội dung không được để trống.' });
      }

      const template = await prisma.postTemplate.create({
        data: {
          name,
          contentSpintax,
          mediaUrls: mediaUrls || [],
          userId
        }

      });

      return res.status(201).json({ data: template });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Cập nhật mẫu bài viết
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { name, contentSpintax, mediaUrls } = req.body;


      const template = await prisma.postTemplate.updateMany({
        where: { id, userId },
        data: {
          name,
          contentSpintax,
          mediaUrls
        }

      });

      if (template.count === 0) {
        return res.status(404).json({ message: 'Không tìm thấy mẫu bài viết hoặc bạn không có quyền.' });
      }

      return res.json({ message: 'Cập nhật thành công.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Xóa mẫu bài viết
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      // Kiểm tra xem mẫu có đang được sử dụng trong Chiến dịch nào không
      const campaignCount = await prisma.campaign.count({
        where: { templateId: id, userId }
      });

      if (campaignCount > 0) {
        return res.status(400).json({ 
          message: `Không thể xóa mẫu này vì đang có ${campaignCount} chiến dịch sử dụng.` 
        });
      }

      const result = await prisma.postTemplate.deleteMany({
        where: { id, userId }
      });

      if (result.count === 0) {
        return res.status(404).json({ message: 'Không tìm thấy mẫu bài viết.' });
      }

      return res.json({ message: 'Đã xóa mẫu bài viết thành công.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Xóa hàng loạt mẫu bài viết
   */
  async deleteMany(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Danh sách ID không hợp lệ.' });
      }

      // Kiểm tra xem có bất kỳ mẫu nào đang được sử dụng trong Chiến dịch không
      const linkedCampaigns = await prisma.campaign.findMany({
        where: {
          userId,
          templateId: { in: ids }
        },
        select: { templateId: true }
      });

      if (linkedCampaigns.length > 0) {
        return res.status(400).json({ 
          message: 'Dữ liệu được chọn có mẫu đang được sử dụng trong Chiến dịch. Vui lòng xóa chiến dịch trước.' 
        });
      }

      const result = await prisma.postTemplate.deleteMany({
        where: {
          userId,
          id: { in: ids }
        }
      });

      return res.json({ message: `Đã xóa thành công ${result.count} mẫu bài viết.`, count: result.count });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
