import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EmprestimosService } from './emprestimos.service';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('emprestimos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmprestimosController {
  constructor(private service: EmprestimosService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('responsavelId') responsavelId?: string) {
    return this.service.findAll({ status, responsavelId });
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('mais-utilizadas')
  maisUtilizadas() {
    return this.service.maisUtilizadas();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('tecnico', 'almoxarife')
  create(@Body() dto: CreateEmprestimoDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id/devolver')
  @Roles('tecnico', 'almoxarife')
  devolver(@Param('id') id: string, @Body('observacoes') observacoes?: string) {
    return this.service.devolver(id, observacoes);
  }
}
