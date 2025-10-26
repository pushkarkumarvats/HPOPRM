import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('statistics')
  getStatistics() {
    return this.adminService.getStatistics();
  }
}
