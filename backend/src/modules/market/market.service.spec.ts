import { Test, TestingModule } from '@nestjs/testing';
import { MarketService } from './market.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MarketService', () => {
  let service: MarketService;
  let prisma: PrismaService;

  const mockPrismaService = {
    price: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    aIPrediction: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MarketService>(MarketService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPriceHistory', () => {
    it('should return price history for a commodity', async () => {
      const commodity = 'soybean';
      const from = new Date('2024-01-01');
      const to = new Date('2024-01-31');

      const mockPrices = [
        {
          id: '1',
          commodity,
          timestamp: new Date('2024-01-01'),
          price: 5500,
          openPrice: 5480,
          highPrice: 5520,
          lowPrice: 5470,
          volume: 10000,
        },
        {
          id: '2',
          commodity,
          timestamp: new Date('2024-01-02'),
          price: 5510,
          openPrice: 5500,
          highPrice: 5530,
          lowPrice: 5490,
          volume: 12000,
        },
      ];

      mockPrismaService.price.findMany.mockResolvedValue(mockPrices);

      const result = await service.getPriceHistory(commodity, from, to);

      expect(result).toHaveLength(2);
      expect(result[0].commodity).toBe(commodity);
      expect(mockPrismaService.price.findMany).toHaveBeenCalledWith({
        where: {
          commodity,
          timestamp: { gte: from, lte: to },
        },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should return empty array if no prices found', async () => {
      mockPrismaService.price.findMany.mockResolvedValue([]);

      const result = await service.getPriceHistory('unknown', new Date(), new Date());

      expect(result).toEqual([]);
    });
  });

  describe('getCurrentPrice', () => {
    it('should return the latest price for a commodity', async () => {
      const commodity = 'mustard';
      const latestPrice = {
        id: '1',
        commodity,
        timestamp: new Date(),
        price: 6200,
        volume: 8000,
      };

      mockPrismaService.price.findFirst.mockResolvedValue(latestPrice);

      const result = await service.getCurrentPrice(commodity);

      expect(result).toEqual(latestPrice);
      expect(mockPrismaService.price.findFirst).toHaveBeenCalledWith({
        where: { commodity },
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should throw NotFoundException if no price found', async () => {
      mockPrismaService.price.findFirst.mockResolvedValue(null);

      await expect(service.getCurrentPrice('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getForecast', () => {
    it('should return forecast for a commodity', async () => {
      const commodity = 'soybean';
      const horizonDays = 30;
      const mockForecast = {
        id: '1',
        commodity,
        horizonDays,
        generatedAt: new Date(),
        pointForecastJson: [
          { date: '2024-02-01', price: 5550 },
          { date: '2024-02-02', price: 5560 },
        ],
        confIntervalsJson: {
          lower: [{ date: '2024-02-01', price: 5450 }],
          upper: [{ date: '2024-02-01', price: 5650 }],
        },
        modelVersion: 'v1.0.0',
        accuracy: 0.85,
      };

      mockPrismaService.aIPrediction.findFirst.mockResolvedValue(mockForecast);

      const result = await service.getForecast(commodity, horizonDays);

      expect(result).toEqual(mockForecast);
      expect(mockPrismaService.aIPrediction.findFirst).toHaveBeenCalledWith({
        where: { commodity, horizonDays },
        orderBy: { generatedAt: 'desc' },
      });
    });

    it('should return null if no forecast available', async () => {
      mockPrismaService.aIPrediction.findFirst.mockResolvedValue(null);

      const result = await service.getForecast('unknown', 30);

      expect(result).toBeNull();
    });
  });

  describe('getMarketStats', () => {
    it('should return market statistics', async () => {
      const commodity = 'soybean';
      const mockStats = {
        _avg: { price: 5500 },
        _max: { price: 5600 },
        _min: { price: 5400 },
        _count: { price: 100 },
      };

      mockPrismaService.price.aggregate.mockResolvedValue(mockStats);
      mockPrismaService.price.findFirst.mockResolvedValue({
        id: '1',
        price: 5550,
        timestamp: new Date(),
      });

      const result = await service.getMarketStats(commodity);

      expect(result).toHaveProperty('avgPrice', 5500);
      expect(result).toHaveProperty('maxPrice', 5600);
      expect(result).toHaveProperty('minPrice', 5400);
      expect(result).toHaveProperty('currentPrice', 5550);
    });
  });
});
