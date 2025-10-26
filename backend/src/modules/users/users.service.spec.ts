import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    farm: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'farmer',
        status: 'active',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { fpo: true, farms: true },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userId = 'user-1';
      const updateDto = {
        name: 'Updated Name',
        phone: '+919876543210',
      };

      const mockUpdatedUser = {
        id: userId,
        name: updateDto.name,
        phone: updateDto.phone,
        email: 'test@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateProfile(userId, updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { ...updateDto, updatedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.updateProfile('nonexistent', { name: 'Test' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('addFarm', () => {
    it('should add a farm for a user', async () => {
      const userId = 'user-1';
      const addFarmDto = {
        farmName: 'Test Farm',
        cropType: 'soybean',
        area: 10.5,
        locationLat: 18.5204,
        locationLong: 73.8567,
        address: 'Test Address',
        storageCapacity: 500,
      };

      const mockFarm = {
        id: 'farm-1',
        ownerId: userId,
        ...addFarmDto,
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, role: 'farmer' });
      mockPrismaService.farm.create.mockResolvedValue(mockFarm);

      const result = await service.addFarm(userId, addFarmDto);

      expect(result).toEqual(mockFarm);
      expect(mockPrismaService.farm.create).toHaveBeenCalledWith({
        data: {
          ownerId: userId,
          ...addFarmDto,
        },
      });
    });

    it('should throw BadRequestException if user is not a farmer', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'market_maker' });

      await expect(
        service.addFarm('user-1', {
          farmName: 'Test',
          cropType: 'soybean',
          area: 10,
          locationLat: 0,
          locationLong: 0,
          address: 'Test',
          storageCapacity: 100,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserFarms', () => {
    it('should return all farms for a user', async () => {
      const userId = 'user-1';
      const mockFarms = [
        {
          id: 'farm-1',
          ownerId: userId,
          farmName: 'Farm 1',
          cropType: 'soybean',
          area: 10,
        },
        {
          id: 'farm-2',
          ownerId: userId,
          farmName: 'Farm 2',
          cropType: 'mustard',
          area: 8,
        },
      ];

      mockPrismaService.farm.findMany.mockResolvedValue(mockFarms);

      const result = await service.getUserFarms(userId);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.farm.findMany).toHaveBeenCalledWith({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('verifyKYC', () => {
    it('should verify user KYC', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        kycVerified: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        kycVerified: true,
        kycVerifiedAt: new Date(),
      });

      const result = await service.verifyKYC(userId);

      expect(result.kycVerified).toBe(true);
      expect(result.kycVerifiedAt).toBeDefined();
    });

    it('should throw BadRequestException if already verified', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        kycVerified: true,
      });

      await expect(service.verifyKYC('user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@test.com' },
        { id: '2', name: 'User 2', email: 'user2@test.com' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(1, 10);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });
  });
});
