import { prisma } from '@fb-automation/database';
import { addAutomationJob } from '../queue';
import { applyFullProtection, checkCampaignCompletion } from '@fb-automation/utils';

/**
 * Service xử lý các nghiệp vụ chiến dịch (Senior Business Logic Layer - MASTER)
 */
export class CampaignService {

  /**
   * Lấy danh sách chiến dịch kèm theo Nhóm chi tiết (Tối ưu Query 2 bước)
   */
  async getAllCampaigns(userId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: {
        template: { select: { name: true } },
        fbAccounts: { select: { id: true, username: true } }
      },
      orderBy: { scheduledAt: 'desc' }
    });

    const allGroupIds = Array.from(new Set(
      campaigns.flatMap(c => (c.targetConfigs as any)?.groupIds || [])
    ));

    const allGroups = await prisma.fbGroup.findMany({
      where: { id: { in: allGroupIds as string[] } },
      select: { id: true, name: true, groupId: true }
    });

    return campaigns.map(c => ({
      ...c,
      groups: allGroups.filter(g => ((c.targetConfigs as any)?.groupIds || []).includes(g.id))
    }));
  }

  /**
   * Tạo chiến dịch
   */
  async createCampaign(userId: string, data: any) {
    const { name, type, targetConfigs, templateId, delayConfig, protectionConfig, fbAccountIds } = data;

    return prisma.campaign.create({
      data: {
        name, type, targetConfigs, userId, templateId,
        delayConfig: delayConfig || { min: 3, max: 10 },
        protectionConfig: protectionConfig || { autoEmoji: true, autoHash: true, shuffleMedia: false },
        fbAccounts: { connect: fbAccountIds.map((id: string) => ({ id })) }
      }
    });
  }

  /**
   * Điều phối việc chạy chiến dịch (Core Master Logic)
   */
  async startCampaign(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { fbAccounts: { select: { id: true } } }
    });

    if (!campaign) throw new Error('Chiến dịch không tồn tại.');

    const batchId = `RUN-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`;
    const { targetConfigs, delayConfig, templateId, fbAccounts } = campaign;
    const groupIds = (targetConfigs as any)?.groupIds || [];
    const minDelay = (delayConfig as any)?.min || 3;
    const maxDelay = (delayConfig as any)?.max || 10;

    // 1. Cập nhật trạng thái chiến dịch
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'PROCESSING', lastBatchId: batchId }
    });

    // 2. Gom logs & jobs (Bulk Performance Optimization - API Early Check)
    const targetGroups = await prisma.fbGroup.findMany({
      where: { id: { in: groupIds } }
    });

    let totalDelayMinutes = 0;
    const logEntries: any[] = [];
    const jobs: any[] = [];

    for (const account of fbAccounts) {
      for (const groupId of groupIds) {
        const groupInfo = targetGroups.find(g => g.id === groupId) as any;

        // [Senior Check] Nếu nhóm đang có bài chờ duyệt, skip ngay từ bước này để tiết kiệm tài nguyên
        if (groupInfo?.isModerated && groupInfo?.pendingSince) {
          logEntries.push({
            campaignId, fbAccountId: account.id, targetId: groupId, batchId,
            actionType: 'SKIP',
            message: `[Skip] Nhóm có bài đang chờ duyệt (${groupInfo.pendingCheckCount}/3 lần).`,
            executedAt: new Date()
          });
          continue;
        }

        const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        totalDelayMinutes += randomDelay;

        const scheduledTime = new Date(Date.now() + totalDelayMinutes * 60 * 1000);
        const jobName = campaign.type === 'AUTO_POST' ? 'AUTO_POST_GROUP' : 'AUTO_COMMENT_GROUP';

        logEntries.push({
          campaignId, fbAccountId: account.id, targetId: groupId, batchId,
          actionType: 'SCHEDULED',
          message: `Dự kiến: ${scheduledTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} (sau ${totalDelayMinutes}p)`,
          executedAt: scheduledTime
        });

        jobs.push({
          name: jobName,
          data: { campaignId, accountId: account.id, groupId: groupId, templateId, batchId },
          options: { delay: totalDelayMinutes * 60 * 1000 }
        });
      }
    }

    // 3. Thực thi song song (Parallel execution)
    if (logEntries.length > 0) {
      await prisma.jobLog.createMany({ data: logEntries });
    }

    if (jobs.length > 0) {
      await Promise.all(jobs.map(j => addAutomationJob(j.name, j.data, j.options)));
    } else if (logEntries.length > 0) {
      // [Case: Toàn bộ bị Skip] Nếu có log nhưng không có job, chốt hoàn thành ngay lập tức
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'COMPLETED' }
      });
    }

    // Kiểm tra chốt trạng thái (Hàm dùng chung từ @fb-automation/utils)
    await checkCampaignCompletion(campaignId, batchId, 'COMPLETE');

    return prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { fbAccounts: true, template: true }
    });
  }

  /**
   * Lấy Logs theo BatchID mới nhất
   */
  async getCampaignLogs(campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, userId } });
    if (!campaign) throw new Error('Chiến dịch không tồn tại.');

    const [logs, groups] = await Promise.all([
      prisma.jobLog.findMany({
        where: { campaignId, batchId: campaign.lastBatchId },
        include: { fbAccount: { select: { username: true } } },
        orderBy: { executedAt: 'desc' }
      }),
      prisma.fbGroup.findMany({
        where: { id: { in: (campaign.targetConfigs as any)?.groupIds || [] } },
        select: { id: true, name: true, groupId: true }
      })
    ]);

    return { logs, groups };
  }

  /**
   * Cập nhật thông tin chiến dịch
   */
  async updateCampaign(campaignId: string, userId: string, data: any) {
    const { fbAccountIds, ...rest } = data;

    // Kiểm tra quyền sở hữu
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, userId } });
    if (!campaign) throw new Error('Chiến dịch không tồn tại.');

    const updateData: any = { ...rest };
    if (fbAccountIds) {
      updateData.fbAccounts = { set: fbAccountIds.map((id: string) => ({ id })) };
    }

    return prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
      include: { fbAccounts: true, template: true }
    });
  }

  /**
   * Xóa chiến dịch
   */
  async deleteCampaign(campaignId: string, userId: string) {
    const result = await prisma.campaign.deleteMany({ where: { id: campaignId, userId } });
    if (result.count === 0) throw new Error('Chiến dịch không tồn tại.');
    return true;
  }

  /**
   * Chạy thử Logic bảo vệ (Test Protection)
   */
  async testProtection(content: string, config: any) {
    return applyFullProtection(content, config, process.env.GEMINI_API_KEY);
  }
}

// Export duy nhất một instance của service để tái sử dụng (Singleton Pattern)
export const campaignService = new CampaignService();
