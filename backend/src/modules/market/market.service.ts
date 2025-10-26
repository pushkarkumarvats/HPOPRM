import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

  async getPriceHistory(commodity: string, from: Date, to: Date) {
    return this.prisma.price.findMany({
      where: { commodity, timestamp: { gte: from, lte: to } },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getLatestPrice(commodity: string) {
    return this.prisma.price.findFirst({
      where: { commodity },
      orderBy: { timestamp: 'desc' },
    });
  }
}
