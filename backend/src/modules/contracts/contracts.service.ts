import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, data: any) {
    const contractHash = this.generateHash(data);
    const totalValue = data.quantity * data.priceFixed;
    
    return this.prisma.contract.create({
      data: {
        ...data,
        buyerId,
        contractHash,
        totalValue,
        status: 'draft',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.contract.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });
  }

  async sign(id: string, signature: string) {
    return this.prisma.contract.update({
      where: { id },
      data: { status: 'signed', signedAt: new Date() },
    });
  }

  private generateHash(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
}
