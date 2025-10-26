import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStatistics() {
    const [users, contracts, orders, trades] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.contract.count(),
      this.prisma.order.count(),
      this.prisma.trade.count(),
    ]);

    return { users, contracts, orders, trades };
  }
}
