import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TradingService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, data: any) {
    return this.prisma.order.create({ data: { ...data, userId } });
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({ where: { userId } });
  }

  async cancelOrder(id: string, userId: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
