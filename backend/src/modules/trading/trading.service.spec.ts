import { Test, TestingModule } from '@nestjs/testing';
import { TradingService } from './trading.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderSide, OrderStatus } from '@prisma/client';

describe('TradingService', () => {
  let service: TradingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    trade: {
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradingService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TradingService>(TradingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a simulated buy order', async () => {
      const userId = 'user-1';
      const createOrderDto = {
        type: 'simulated' as const,
        side: OrderSide.buy,
        commodity: 'soybean',
        price: 5500,
        quantity: 100,
      };

      const mockOrder = {
        id: 'order-1',
        userId,
        ...createOrderDto,
        filledQuantity: 0,
        status: OrderStatus.pending,
        createdAt: new Date(),
      };

      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder(userId, createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId,
          ...createOrderDto,
          filledQuantity: 0,
          status: OrderStatus.pending,
        },
      });
    });

    it('should create a simulated sell order', async () => {
      const userId = 'user-2';
      const createOrderDto = {
        type: 'simulated' as const,
        side: OrderSide.sell,
        commodity: 'mustard',
        price: 6200,
        quantity: 50,
      };

      const mockOrder = {
        id: 'order-2',
        userId,
        ...createOrderDto,
        filledQuantity: 0,
        status: OrderStatus.pending,
        createdAt: new Date(),
      };

      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder(userId, createOrderDto);

      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException for invalid quantity', async () => {
      const userId = 'user-1';
      const createOrderDto = {
        type: 'simulated' as const,
        side: OrderSide.buy,
        commodity: 'soybean',
        price: 5500,
        quantity: -10, // Invalid
      };

      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getOrder', () => {
    it('should return order by id', async () => {
      const orderId = 'order-1';
      const mockOrder = {
        id: orderId,
        userId: 'user-1',
        type: 'simulated',
        side: OrderSide.buy,
        commodity: 'soybean',
        price: 5500,
        quantity: 100,
        filledQuantity: 0,
        status: OrderStatus.pending,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrder(orderId);

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: { user: true },
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrder('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserOrders', () => {
    it('should return all orders for a user', async () => {
      const userId = 'user-1';
      const mockOrders = [
        {
          id: 'order-1',
          userId,
          side: OrderSide.buy,
          commodity: 'soybean',
          price: 5500,
          quantity: 100,
          status: OrderStatus.pending,
        },
        {
          id: 'order-2',
          userId,
          side: OrderSide.sell,
          commodity: 'mustard',
          price: 6200,
          quantity: 50,
          status: OrderStatus.filled,
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.getUserOrders(userId);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { trades: true },
      });
    });

    it('should filter orders by status', async () => {
      const userId = 'user-1';
      const status = OrderStatus.filled;

      mockPrismaService.order.findMany.mockResolvedValue([]);

      await service.getUserOrders(userId, status);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId, status },
        orderBy: { createdAt: 'desc' },
        include: { trades: true },
      });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a pending order', async () => {
      const orderId = 'order-1';
      const userId = 'user-1';
      const mockOrder = {
        id: orderId,
        userId,
        status: OrderStatus.pending,
        filledQuantity: 0,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.cancelled,
      });

      const result = await service.cancelOrder(orderId, userId);

      expect(result.status).toBe(OrderStatus.cancelled);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.cancelled, updatedAt: expect.any(Date) },
      });
    });

    it('should throw BadRequestException if order not pending', async () => {
      const orderId = 'order-1';
      const userId = 'user-1';
      const mockOrder = {
        id: orderId,
        userId,
        status: OrderStatus.filled,
        filledQuantity: 100,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.cancelOrder(orderId, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if order does not belong to user', async () => {
      const orderId = 'order-1';
      const userId = 'user-1';
      const mockOrder = {
        id: orderId,
        userId: 'other-user',
        status: OrderStatus.pending,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.cancelOrder(orderId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTradeHistory', () => {
    it('should return trade history for a user', async () => {
      const userId = 'user-1';
      const mockTrades = [
        {
          id: 'trade-1',
          buyOrderId: 'order-1',
          sellOrderId: 'order-2',
          price: 5500,
          quantity: 100,
          executedAt: new Date(),
          buyOrder: { userId },
          sellOrder: { userId: 'user-2' },
        },
      ];

      mockPrismaService.trade.findMany.mockResolvedValue(mockTrades);

      const result = await service.getTradeHistory(userId);

      expect(result).toHaveLength(1);
      expect(result[0].price).toBe(5500);
    });
  });
});
