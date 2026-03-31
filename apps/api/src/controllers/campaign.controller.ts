import { Request, Response } from 'express';
import { prisma } from '@fb-automation/database';
import { addAutomationJob } from '../queue';
import { applyFullProtection } from '@fb-automation/utils';

export class CampaignController {
  /**
   * Lấy danh sách chiến dịch của User
   */
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const campaigns = await prisma.campaign.findMany({
        where: { userId },
        include: {
          template: { select: { name: true } },
          fbAccounts: { select: { id: true, } }
        },
        orderBy: { scheduledAt: 'desc' }
      });
      return res.json({ data: campaigns });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Tạo một Chiến dịch (Campaign) mới
   */
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, type, targetConfigs, templateId, delayConfig, protectionConfig, fbAccountIds } = req.body;

      if (!name || !targetConfigs || !fbAccountIds) {
        return res.status(400).json({ message: 'Thiếu thông tin chiến dịch.' });
      }

      // Tạo Campaign và kết nối với các FbAccount
      const campaign = await prisma.campaign.create({
        data: {
          name,
          type,
          targetConfigs,
          delayConfig: delayConfig || { min: 3, max: 10 },
          protectionConfig: protectionConfig || { autoEmoji: true, autoHash: true, shuffleMedia: false },
          userId,
          templateId,
          fbAccounts: {
            connect: fbAccountIds.map((id: string) => ({ id }))
          }
        }
      });

      return res.status(201).json({ data: campaign });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Cập nhật trạng thái chiến dịch (Vd: Hoạt động/Tạm dừng)
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; // DRAFT, SCHEDULED, PROCESSING, COMPLETED, PAUSED
      const userId = (req as any).user.id;

      const campaignQuery = await prisma.campaign.findUnique({
        where: { id },
        include: { fbAccounts: { select: { id: true } } }
      });

      if (!campaignQuery) return res.status(404).json({ message: 'Không tìm thấy chiến dịch.' });

      // Cập nhật trạng thái trong DB
      await prisma.campaign.update({
        where: { id },
        data: { status }
      });

      // Nếu chuyển sang PROCESSING -> Bắt đầu đẩy Jobs vào Queue
      if (status === 'PROCESSING') {
        const { fbAccounts, targetConfigs, delayConfig, templateId } = campaignQuery as any;
        const groupIds = targetConfigs?.groupIds || [];

        // Tạo Batch ID duy nhất cho lượt chạy này
        const batchId = `RUN-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`;

        // Cập nhật lastBatchId vào Campaign
        await prisma.campaign.update({
          where: { id },
          data: { lastBatchId: batchId }
        });

        let totalStaggerDelay = 0;
        // Giao diện người dùng setup theo PHÚT, fallback 3-10p cho an toàn
        const minDelay = delayConfig?.min || 3;
        const maxDelay = delayConfig?.max || 10;

        console.log(`[API] 🛰️ Đang xếp hàng ${fbAccounts.length * groupIds.length} lệnh. Delay: ${minDelay}-${maxDelay} phút`);

        for (const account of fbAccounts) {
          for (const groupId of groupIds) {
            // Tăng dần delay theo PHÚT
            const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

            totalStaggerDelay += randomDelay;

            const jobName = campaignQuery.type === 'AUTO_POST' ? 'AUTO_POST_GROUP' : 'AUTO_COMMENT_GROUP';

            await addAutomationJob(jobName, {
              campaignId: id,
              accountId: account.id,
              groupId,
              templateId,
              batchId
            }, {
              // PHÚT * 60 giây * 1000 ms
              delay: totalStaggerDelay * 60 * 1000
            });

            console.log(`[API] ➕ Đã lên lịch sau ${totalStaggerDelay} phút (Account: ${account.id})`);
          }
        }

      }

      return res.json({ message: `Đã cập nhật trạng thái chiến dịch thành ${status} và xếp hàng lệnh.` });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lấy lịch sử Logs của một chiến dịch
   */
  async getLogs(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      // Đảm bảo campaign thuộc về user này
      const campaign = await prisma.campaign.findFirst({
        where: { id, userId }
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Không tìm thấy chiến dịch.' });
      }

      const logs = await prisma.jobLog.findMany({
        where: { campaignId: id },
        include: {
          fbAccount: { select: { username: true } }
        },
        orderBy: { executedAt: 'desc' }
      });

      return res.json({ data: logs });
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
      const { name, type, templateId, targetConfigs, delayConfig, protectionConfig, fbAccountIds } = req.body;

      // Đảm bảo campaign thuộc về user
      const campaign = await prisma.campaign.findFirst({
        where: { id, userId }
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Không tìm thấy chiến dịch.' });
      }

      const updatedCampaign = await prisma.campaign.update({
        where: { id },
        data: {
          name,
          type,
          templateId,
          targetConfigs,
          delayConfig,
          protectionConfig,
          // Cập nhật quan hệ 1-Nhiều hoặc Nhiều-Nhiều
          fbAccounts: fbAccountIds ? {
            set: fbAccountIds.map((id: string) => ({ id }))
          } : undefined
        },
        include: { fbAccounts: true, template: true }
      });

      return res.json({
        message: 'Cập nhật chiến dịch thành công.',
        data: updatedCampaign
      });
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

      const result = await prisma.campaign.deleteMany({
        where: { id, userId }
      });

      if (result.count === 0) {
        return res.status(404).json({ message: 'Không tìm thấy chiến dịch.' });
      }

      return res.json({ message: 'Đã xóa chiến dịch thành công.' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Test thực tế luồng bảo vệ (Preview nội dung)
   */
  async testProtection(req: Request, res: Response) {
    try {
      const { content, protectionConfig } = req.body;

      const transformed = await applyFullProtection(
        content,
        protectionConfig,
        process.env.GEMINI_API_KEY
      );

      return res.json({ data: transformed });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
