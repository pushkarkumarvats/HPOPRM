import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password@123',
        phone: '+919876543210',
        role: 'farmer' as const,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        ...registerDto,
        passwordHash: 'hashed',
        createdAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('id', '1');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ConflictException if email exists', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'Password@123',
        phone: '+919876543210',
        role: 'farmer' as const,
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'Password@123' };
      const user = {
        id: '1',
        email: loginDto.email,
        passwordHash: await argon2.hash(loginDto.password),
        status: 'active',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'access_token');
      expect(result).toHaveProperty('refreshToken', 'refresh_token');
      expect(mockPrismaService.refreshToken.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'WrongPassword' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = { email: 'test@example.com', password: 'Password@123' };
      const user = {
        id: '1',
        email: loginDto.email,
        passwordHash: await argon2.hash(loginDto.password),
        status: 'suspended',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid id', async () => {
      const user = { id: '1', email: 'test@example.com', status: 'active' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser('1');

      expect(result).toEqual(user);
    });

    it('should return null for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('999');

      expect(result).toBeNull();
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens for valid refresh token', async () => {
      const refreshToken = 'valid_refresh_token';
      const userId = '1';

      mockJwtService.verify.mockReturnValue({ sub: userId });
      mockPrismaService.refreshToken.findFirst.mockResolvedValue({
        id: '1',
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 86400000),
      });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, status: 'active' });
      mockJwtService.sign.mockReturnValueOnce('new_access').mockReturnValueOnce('new_refresh');
      mockPrismaService.refreshToken.delete.mockResolvedValue({});
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshTokens(refreshToken);

      expect(result).toHaveProperty('accessToken', 'new_access');
      expect(result).toHaveProperty('refreshToken', 'new_refresh');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens('invalid_token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
