import { Body, Controller, Get, Patch, Post, UseGuards, Param } from '@nestjs/common';
import { PerfisService } from './perfis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('perfis')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PerfisController {
  constructor(private service: PerfisService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: { nome: string; slug: string; descricao?: string }) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { nome?: string; descricao?: string; ativo?: boolean }) {
    return this.service.update(id, body);
  }
}
