import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('contracts')
@ApiBearerAuth('access-token')
@Controller('contracts')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() data: any) {
    return this.contractsService.create(user.id, data);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.contractsService.findAll(user.id);
  }

  @Post(':id/sign')
  sign(@Param('id') id: string, @Body() data: { signature: string }) {
    return this.contractsService.sign(id, data.signature);
  }
}
