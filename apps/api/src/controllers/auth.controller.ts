import { Request, Response } from 'express';
import { prisma } from '@fb-automation/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fb-automation-super-secret-key';

export const login = async (req: Request, res: Response) => {
  try {
    console.log("[Auth:Login] req.body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      status: 'ok',
      data: {
        token,
        user: { id: user.id, email: user.email, subscriptionPlan: user.subscriptionPlan }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: String(error) });
  }
};

// Đăng ký (Dành cho Admin khởi tạo tài khoản ban đầu)
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { email, passwordHash, subscriptionPlan: 'ADMIN' }
    });

    res.status(201).json({ status: 'ok', data: { id: user.id, email: user.email } });
  } catch (error) {
    console.log("[Auth:Register] error:", error);
    res.status(500).json({ status: 'error', message: String(error) });
  }
};
