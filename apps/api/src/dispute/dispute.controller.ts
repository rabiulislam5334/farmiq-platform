import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/dispute.dto';

@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputeController {
  constructor(private disputeService: DisputeService) {}

  @Post()
  create(@Body() dto: CreateDisputeDto, @Req() req: any) {
    return this.disputeService.create(req.user.sub, dto);
  }

  @Get('my-disputes')
  findMy(@Req() req: any) {
    return this.disputeService.findMyDisputes(req.user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.disputeService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputeService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputeService.resolve(id, dto);
  }
}
