import { Request, Response } from 'express';
import { prisma } from '@fb-automation/database';
import { addAutomationJob } from '../queue';

export class GroupController {
  /**
   * Lấy danh sách nhóm (Hỗ trợ Bulk Fetch)
   * Trả về định dạng: { data: [] }
   */
  async getAllGroups(req: Request, res: Response) {
    try {
      const { accountIds } = req.query;
      const userId = (req as any).user.id;

      let whereClause: any = {
        fbAccount: { userId } // Bảo mật: Chỉ lấy nhóm từ tài khoản của chính User này
      };

      if (accountIds && typeof accountIds === 'string' && accountIds !== "") {
        const ids = accountIds.split(',').filter(Boolean);
        if (ids.length > 0) {
          whereClause.fbAccountId = { in: ids };
        }
      }

      const groups = await prisma.fbGroup.findMany({
        where: whereClause,
        include: {
          fbAccount: {
            select: { username: true, fbUid: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      return res.json({ data: groups });
    } catch (error: any) {
      console.error("GetAllGroups Error:", error);
      return res.status(500).json({ message: 'Lỗi nạp danh sách nhóm trên server' });
    }
  }

  /**
   * Lấy danh sách nhóm của một tài khoản cụ thể (Modal view)
   */
  async getAccountGroups(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const userId = (req as any).user.id;

      const groups = await prisma.fbGroup.findMany({
        where: {
          fbAccountId: accountId,
          fbAccount: { userId }
        },
        orderBy: { name: 'asc' }
      });

      return res.json({ data: groups });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Đồng bộ hóa hàng loạt cho nhiều tài khoản
   */
  async syncBulkGroups(req: Request, res: Response) {
    try {
      const { accountIds } = req.body;
      const userId = (req as any).user.id;

      if (!Array.isArray(accountIds) || accountIds.length === 0) {
        return res.status(400).json({ message: 'Danh sách tài khoản thiếu hoặc không đúng định dạng.' });
      }

      // Kiểm kê lại xem User có thực sự sở hữu các accountIds này không
      const accounts = await prisma.fbAccount.findMany({
        where: {
          id: { in: accountIds },
          userId
        },
        select: { id: true }
      });

      if (accounts.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền đồng bộ các tài khoản này.' });
      }

      // Gửi lệnh vào hàng chờ xử lý
      const jobs = accounts.map(acc => addAutomationJob('SYNC_GROUPS', { accountId: acc.id }));
      await Promise.all(jobs);

      return res.json({
        message: `Đã xếp hàng đồng bộ cho ${accounts.length} tài khoản thành công.`
      });
    } catch (error: any) {
      console.error("SyncBulkGroups Error:", error);
      return res.status(500).json({ message: 'Lỗi hệ thống khi kích hoạt đồng bộ' });
    }
  }

  /**
   * Xử lý tìm kiếm/lọc nhóm (Có bảo mật)
   */
  async searchGroups(req: Request, res: Response) {
    try {
      const { q, accountId } = req.query;
      const userId = (req as any).user.id;

      const groups = await prisma.fbGroup.findMany({
        where: {
          fbAccountId: accountId as string,
          fbAccount: { userId },
          name: {
            contains: q as string,
            mode: 'insensitive'
          }
        }
      });

      return res.json({ data: groups });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
