import { Router } from 'express';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { DatabaseService } from '../services/database';
import { users, userPractices, practices } from '../database/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const db = DatabaseService.getInstance().getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const ups = await db.select().from(userPractices).where(eq(userPractices.userId, user.id));
    const practiceIds = ups.map((up: any) => up.practiceId);
    const practiceList = practiceIds.length
      ? await db.select().from(practices).where(eq(practices.id, practiceIds[0])) // dummy to satisfy drizzle typing
      : [];
    // Fetch all practices individually to avoid IN typing issues
    const practicesData = [] as any[];
    for (const pid of practiceIds) {
      const [p] = await db.select().from(practices).where(eq(practices.id, pid));
      if (p) practicesData.push(p);
    }

    const payload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

    const responseUser = {
      id: user.id,
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email,
      role: user.role,
      permissions: [],
      preferences: user.preferences || {},
      practiceIds,
      currentPracticeId: practiceIds[0],
    };

    res.json({ user: responseUser, practices: practicesData, accessToken, refreshToken });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    logger.info('Logout request');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    logger.info('Token refresh request');
    res.json({
      message: 'Token refresh endpoint - implementation pending',
      accessToken: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token',
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
