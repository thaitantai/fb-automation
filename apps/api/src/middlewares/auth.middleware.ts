import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fb-automation-super-secret-key';

export const protectRoute = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // Lưu thông tin giải mã (chứa userID) vào Request để các Controller khác sử dụng
    (req as any).user = decoded; 
    
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Not authorized, invalid or expired token' });
  }
};
