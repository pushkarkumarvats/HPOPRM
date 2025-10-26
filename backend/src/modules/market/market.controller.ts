import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MarketService } from './market.service';

@ApiTags('market')
@ApiBearerAuth('access-token')
@Controller('market')
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Get('price-history')
  @ApiOperation({ summary: 'Get historical price data' })
  getPriceHistory(
    @Query('commodity') commodity: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.marketService.getPriceHistory(commodity, new Date(from), new Date(to));
  }

  @Get('latest-price')
  @ApiOperation({ summary: 'Get latest price for commodity' })
  getLatestPrice(@Query('commodity') commodity: string) {
    return this.marketService.getLatestPrice(commodity);
  }
}
