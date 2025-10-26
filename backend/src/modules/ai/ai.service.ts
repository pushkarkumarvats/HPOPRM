import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getForecast(commodity: string, horizonDays: number) {
    // Try to get latest prediction from DB
    const prediction = await this.prisma.aIPrediction.findFirst({
      where: { commodity, horizonDays },
      orderBy: { generatedAt: 'desc' },
    });

    if (prediction) return prediction;

    // Generate stub forecast
    const forecast = this.generateStubForecast(commodity, horizonDays);
    return this.prisma.aIPrediction.create({ data: forecast });
  }

  private generateStubForecast(commodity: string, horizonDays: number) {
    const basePrice = commodity === 'soybean' ? 5500 : 6200;
    const forecasts = [];
    
    for (let i = 1; i <= horizonDays; i++) {
      forecasts.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        price: basePrice + Math.sin(i / 10) * 100,
      });
    }

    return {
      commodity,
      horizonDays,
      pointForecastJson: forecasts,
      confIntervalsJson: { lower: forecasts, upper: forecasts },
      modelVersion: 'v1.0.0-stub',
      modelType: 'deterministic',
    };
  }
}
