import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TradingService } from './trading.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('trading')
@ApiBearerAuth('access-token')
@Controller('trading')
export class TradingController {
  constructor(private tradingService: TradingService) {}

  @Post('orders')
  createOrder(@CurrentUser() user: any, @Body() data: any) {
    return this.tradingService.createOrder(user.id, data);
  }

  @Get('orders')
  getOrders(@CurrentUser() user: any) {
    return this.tradingService.getOrders(user.id);
  }

  @Delete('orders/:id')
  cancelOrder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tradingService.cancelOrder(id, user.id);
  }
}
