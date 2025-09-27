import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NewUser, User, UserRole } from '../database/schema';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { DatabaseService } from './database';
import { RedisService } from './redis';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends Omit<NewUser, 'passwordHash'> {
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  practiceIds: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private static instance: AuthService;
  private db: DatabaseService;
  private redis: RedisService;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.redis = RedisService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.findUserByEmail(userData.email);
      if (existingUser) {
        throw new AppError('User already exists with this email', 409);
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const newUser = await this.db.createUser({
        ...userData,
        passwordHash,
      });

      logger.info(`User registered: ${newUser.email}`);
      return newUser;
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens & { user: Omit<User, 'passwordHash'> }> {
    try {
      const { email, password } = credentials;

      // Find user by email
      const user = await this.findUserByEmail(email);
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError('Account is disabled', 401);
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Get user practices
      const userPractices = await this.db.getUserPractices(user.id);
      const practiceIds = userPractices.map(up => up.practiceId);

      // Generate tokens
      const tokens = await this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        practiceIds,
      });

      // Update last login
      await this.db.updateUserLastLogin(user.id);

      // Store refresh token in Redis
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      logger.info(`User logged in: ${user.email}`);

      const { passwordHash, ...userWithoutPassword } = user;
      return {
        ...tokens,
        user: userWithoutPassword,
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user by invalidating tokens
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      // Remove refresh token from Redis
      if (refreshToken) {
        await this.redis.del(`refresh_token:${userId}`);
        await this.redis.del(`refresh_token_data:${refreshToken}`);
      }

      // Add access token to blacklist (if provided in headers)
      // This would require the token to be passed, but for now we'll just remove refresh token

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = this.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in Redis
      const storedToken = await this.redis.get(`refresh_token:${payload.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Get user data
      const user = await this.findUserById(payload.userId);
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      // Get user practices
      const userPractices = await this.db.getUserPractices(user.id);
      const practiceIds = userPractices.map(up => up.practiceId);

      // Generate new tokens
      const tokens = await this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        practiceIds,
      });

      // Store new refresh token
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      return payload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  /**
   * Verify JWT refresh token
   */
  private verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
      return payload;
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessTokenExpiration = '15m';
    const refreshTokenExpiration = '7d';

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: accessTokenExpiration,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: refreshTokenExpiration,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Store refresh token in Redis with expiration
   */
  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiration = 7 * 24 * 60 * 60; // 7 days in seconds

    await this.redis.setex(`refresh_token:${userId}`, expiration, refreshToken);
    await this.redis.setex(`refresh_token_data:${refreshToken}`, expiration, userId);
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Find user by email
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    return this.db.findUserByEmail(email);
  }

  /**
   * Find user by ID
   */
  private async findUserById(userId: string): Promise<User | null> {
    return this.db.findUserById(userId);
  }

  /**
   * Check if access token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const result = await this.redis.get(`blacklisted_token:${token}`);
      return result !== null;
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      return false;
    }
  }

  /**
   * Add token to blacklist
   */
  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    try {
      await this.redis.setex(`blacklisted_token:${token}`, expiresIn, 'true');
    } catch (error) {
      logger.error('Error blacklisting token:', error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await this.db.updateUserPassword(userId, newPasswordHash);

      // Invalidate all refresh tokens for this user
      await this.redis.del(`refresh_token:${userId}`);

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<string> {
    try {
      const user = await this.findUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        return 'If an account with this email exists, a password reset link has been sent.';
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // Store reset token in Redis
      await this.redis.setex(`password_reset:${user.id}`, 3600, resetToken);

      // Here you would typically send an email with the reset token
      // For now, we'll just log it
      logger.info(`Password reset requested for user: ${email}, token: ${resetToken}`);

      return 'If an account with this email exists, a password reset link has been sent.';
    } catch (error) {
      logger.error('Password reset request failed:', error);
      throw error;
    }
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      // Verify reset token
      const payload = jwt.verify(resetToken, process.env.JWT_SECRET!) as any;

      if (payload.type !== 'password_reset') {
        throw new AppError('Invalid reset token', 400);
      }

      // Check if token exists in Redis
      const storedToken = await this.redis.get(`password_reset:${payload.userId}`);
      if (!storedToken || storedToken !== resetToken) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await this.db.updateUserPassword(payload.userId, newPasswordHash);

      // Remove reset token
      await this.redis.del(`password_reset:${payload.userId}`);

      // Invalidate all refresh tokens for this user
      await this.redis.del(`refresh_token:${payload.userId}`);

      logger.info(`Password reset completed for user: ${payload.userId}`);
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }
}
