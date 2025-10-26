import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('forecast')
  @ApiOperation({ summary: 'Get AI price forecast' })
  getForecast(
    @Query('commodity') commodity: string,
    @Query('horizon_days') horizonDays: number = 30,
  ) {
    return this.aiService.getForecast(commodity, horizonDays);
  }
}
