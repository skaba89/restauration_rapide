import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  otpRequestSchema,
  otpVerifySchema,
  updatePasswordSchema,
  userRoleSchema,
} from '@/lib/validations/auth';

describe('Auth Validations', () => {
  describe('loginSchema', () => {
    it('should validate login with email', () => {
      const result = loginSchema.safeParse({
        action: 'login',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('should validate login with phone', () => {
      const result = loginSchema.safeParse({
        action: 'login',
        phone: '+2250700000001',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        action: 'login',
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email invalide');
      }
    });

    it('should reject short password', () => {
      const result = loginSchema.safeParse({
        action: 'login',
        email: 'test@example.com',
        password: '12345',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('6 caracteres');
      }
    });

    it('should require either email or phone', () => {
      const result = loginSchema.safeParse({
        action: 'login',
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate valid registration', () => {
      const result = registerSchema.safeParse({
        action: 'register',
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.success).toBe(true);
    });

    it('should require password with uppercase and number', () => {
      const result = registerSchema.safeParse({
        action: 'register',
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.success).toBe(false);
    });

    it('should default role to CUSTOMER', () => {
      const result = registerSchema.safeParse({
        action: 'register',
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('CUSTOMER');
      }
    });
  });

  describe('otpRequestSchema', () => {
    it('should validate OTP request with phone', () => {
      const result = otpRequestSchema.safeParse({
        action: 'request-otp',
        type: 'LOGIN',
        phone: '+2250700000001',
      });

      expect(result.success).toBe(true);
    });

    it('should validate OTP request with email', () => {
      const result = otpRequestSchema.safeParse({
        action: 'request-otp',
        type: 'VERIFY_EMAIL',
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
    });

    it('should require phone or email', () => {
      const result = otpRequestSchema.safeParse({
        action: 'request-otp',
        type: 'LOGIN',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('otpVerifySchema', () => {
    it('should validate 6-digit OTP', () => {
      const result = otpVerifySchema.safeParse({
        action: 'verify-otp',
        type: 'LOGIN',
        otpCode: '123456',
        phone: '+2250700000001',
      });

      expect(result.success).toBe(true);
    });

    it('should reject OTP with wrong length', () => {
      const result = otpVerifySchema.safeParse({
        action: 'verify-otp',
        type: 'LOGIN',
        otpCode: '12345',
        phone: '+2250700000001',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('6 chiffres');
      }
    });
  });

  describe('updatePasswordSchema', () => {
    it('should validate password update', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'NewPassword456',
      });

      expect(result.success).toBe(true);
    });

    it('should require strong new password', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'weak',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('userRoleSchema', () => {
    it('should accept valid roles', () => {
      const validRoles = [
        'SUPER_ADMIN',
        'ORG_ADMIN',
        'RESTAURANT_ADMIN',
        'CUSTOMER',
        'DRIVER',
        'STAFF',
      ];

      validRoles.forEach((role) => {
        const result = userRoleSchema.safeParse(role);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid role', () => {
      const result = userRoleSchema.safeParse('INVALID_ROLE');
      expect(result.success).toBe(false);
    });
  });
});
