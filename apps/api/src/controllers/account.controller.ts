import { Request, Response } from 'express';
import { prisma } from '@fb-automation/database';
import { addAutomationJob } from '../queue';

export const addFbAccount = async (req: Request, res: Response) => {
  try {
    const { username, password, proxyId } = req.body;
    const userId = (req as any).user.id;

    if (!username || !password) {
      return res.status(400).json({ message: 'Tài khoản và mật khẩu Facebook là bắt buộc.' });
    }

    // [Trung tài khoản] Kiểm tra xem tài khoản đã tồn tại chưa
    const existingAccount = await prisma.fbAccount.findFirst({
      where: {
        username: username,
        userId: userId
      }
    });

    if (existingAccount) {
      if (existingAccount.status === 'ACTIVE' || existingAccount.status === 'CONNECTING') {
        return res.status(400).json({ message: 'Tài khoản này đã tồn tại và đang hoạt động.' });
      }
      // Nếu trạng thái ERROR hoặc DISCONNECTED, xóa record cũ để add record mới sạch sẽ hơn
      await prisma.fbAccount.delete({ where: { id: existingAccount.id } });
    }

    // [Công việc đang xử lý] Kiểm tra xem username này có đang được job nào khác xử lý không
    const pendingJob = await prisma.automationJob.findFirst({
      where: {
        jobName: 'LOGIN_ACCOUNT',
        status: 'PENDING',
        payload: {
          path: ['username'],
          equals: username
        }
      }
    });

    if (pendingJob) {
      return res.status(400).json({ message: 'Tài khoản này đang được hệ thống xử lý, vui lòng không gửi lại.' });
    }

    // [Transactional Outbox Pattern]
    const result = await prisma.$transaction(async (tx) => {
      const tempUid = `TEMP-${Date.now()}`; // Dùng tiền tố TEMP để dễ phân biệt

      const account = await tx.fbAccount.create({
        data: {
          userId,
          fbUid: tempUid,
          username,
          password,
          sessionData: "PENDING_AUTOMATION",
          proxyId: proxyId || null,
          status: 'CONNECTING'
        }
      });

      const outboxJob = await tx.automationJob.create({
        data: {
          jobName: 'LOGIN_ACCOUNT',
          payload: { accountId: account.id, username, password, proxyId, userId },
          status: 'PENDING'
        }
      });

      return { account, outboxJob };
    });

    // Sau khi Transaction thành công, ta thử đẩy vào Redis ngay lập tức.
    // Nếu Redis lỗi ở đây, chúng ta vẫn an tâm vì Job đã nằm trong bảng AutomationJob (SQL).
    try {
      await addAutomationJob(result.outboxJob.jobName, result.outboxJob.payload as any);
      await prisma.automationJob.update({
        where: { id: result.outboxJob.id },
        data: { status: 'COMPLETED' } // Đánh dấu đã đẩy vào Redis thành công
      });
    } catch (redisError) {
      console.warn("⚠️ Redis temporary down, Outbox Relay will pick this up later.");
    }

    res.status(201).json({
      message: 'Yêu cầu kết nối đã được lưu hệ thống đang xử lý...',
      account: result.account
    });
  } catch (error: any) {
    console.error('Add FbAccount error:', error);
    res.status(500).json({ message: 'Lỗi server khi kết nối tài khoản' });
  }
};

export const getMyFbAccounts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const accounts: any[] = await prisma.fbAccount.findMany({
      where: { userId },
      include: {
        proxy: true, // Lấy luôn thông tin proxy nếu có
        _count: {
          select: { fbGroups: true }
        }
      },
      orderBy: { lastLogin: 'desc' }
    });

    // Mapped results to flatten the _count object for easier frontend consumption
    const formattedAccounts = accounts.map(acc => ({
      ...acc,
      groupsCount: acc._count?.fbGroups || 0
    }));

    res.json({ data: formattedAccounts });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteFbAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Chỉ được xóa tài khoản của chính mình
    await prisma.fbAccount.deleteMany({
      where: { id, userId }
    });

    res.json({ message: 'Đã xóa tài khoản Facebook' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi xóa tài khoản' });
  }
};

export const bulkDeleteFbAccounts = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    const userId = (req as any).user.id;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: 'Danh sách ID không hợp lệ.' });
    }

    await prisma.fbAccount.deleteMany({
      where: {
        id: { in: ids },
        userId
      }
    });

    res.json({ message: 'Đã gỡ bỏ các tài khoản được chọn.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gỡ tài khoản hàng loạt.' });
  }
};

export const reconnectFbAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const account = await prisma.fbAccount.findFirst({
      where: { id, userId }
    });

    if (!account) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

    // Đưa về trạng thái CONNECTING
    await prisma.fbAccount.update({
      where: { id },
      data: { status: 'CONNECTING' }
    });

    // Tạo Outbox Job để Worker xử lý login lại
    const outboxJob = await prisma.automationJob.create({
      data: {
        jobName: 'LOGIN_ACCOUNT',
        payload: {
          accountId: account.id,
          username: account.username,
          password: account.password,
          proxyId: account.proxyId,
          userId
        },
        status: 'PENDING'
      }
    });

    // Đẩy job vào Redis ngay lập tức
    await addAutomationJob(outboxJob.jobName, outboxJob.payload as any);
    await prisma.automationJob.update({
      where: { id: outboxJob.id },
      data: { status: 'COMPLETED' }
    });

    res.json({ message: 'Hệ thống đang thực hiện kết nối lại tài khoản...' });
  } catch (error) {
    console.error('Reconnect error:', error);
    res.status(500).json({ message: 'Lỗi khi yêu cầu kết nối lại.' });
  }
};

export const disconnectFbAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await prisma.fbAccount.updateMany({
      where: { id, userId },
      data: {
        status: 'DISCONNECTED',
      }
    });

    res.json({ message: 'Đã ngắt kết nối tài khoản.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi ngắt kết nối tài khoản.' });
  }
};
