import { Request, Response } from 'express';
import { campaignService } from '../services/campaign.service';
import { prisma } from '@fb-automation/database';

/**
 * Controller xử lý chiến dịch (Senior Thin Controller - MASTER REFACTORED)
 */
export class CampaignController {
  
  /**
   * Lấy danh sách chiến dịch kèm theo thông tin chi tiết
   */
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = await campaignService.getAllCampaigns(userId);
      return res.json({ data });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Tạo chiến dịch mới
   */
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const campaign = await campaignService.createCampaign(userId, req.body);
      return res.status(201).json({ data: campaign });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Cập nhật trạng thái và Điều phối Job
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (status === 'PROCESSING') {
        const finalCampaign = await campaignService.startCampaign(id);
        return res.json({ message: 'Đã lên lịch thực thi chiến dịch.', data: finalCampaign });
      }

      const updated = await prisma.campaign.update({
        where: { id },
        data: { status },
        include: { fbAccounts: true, template: true }
      });

      return res.json({ message: `Đã cập nhật trạng thái thành ${status}.`, data: updated });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lấy lịch sử Logs (Filtered by latest batch)
   */
  async getLogs(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const data = await campaignService.getCampaignLogs(id, userId);
      return res.json({ data });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Cập nhật thông tin chiến dịch
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const updated = await campaignService.updateCampaign(id, userId, req.body);
      return res.json({ message: 'Cập nhật thành công.', data: updated });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Xóa chiến dịch
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      await campaignService.deleteCampaign(id, userId);
      return res.json({ message: 'Đã xóa chiến dịch thành công.' });
    } catch (error: any) {
      return res.status(error.message === 'Chiến dịch không tồn tại.' ? 404 : 500)
                .json({ message: error.message });
    }
  }

  /**
   * Test Protection Logic
   */
  async testProtection(req: Request, res: Response) {
    try {
      const { content, protectionConfig } = req.body;
      const data = await campaignService.testProtection(content, protectionConfig);
      return res.json({ data });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
