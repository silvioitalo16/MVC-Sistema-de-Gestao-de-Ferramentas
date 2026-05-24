import { Controller, Get, Patch, Param, Query, Body, UseGuards, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RegisterDto } from '../auth/dto/register.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private service: UsuariosService) {}

  @Get()
  @Roles('admin', 'tecnico', 'almoxarife')
  findAll(@Query('perfil') perfil?: string) {
    if (perfil) return this.service.findByPerfil(perfil);
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('admin', 'tecnico', 'almoxarife')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: RegisterDto) {
    return this.service.create(dto);
  }

  @Patch(':id/desativar')
  @Roles('admin')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Patch(':id/reset-password')
  @Roles('admin')
  resetPassword(@Param('id') id: string, @Body() body: { novaSenha: string }) {
    return this.service.resetPassword(id, body.novaSenha);
  }

  @Patch(':id/perfil')
  @Roles('admin')
  updatePerfil(@Param('id') id: string, @Body() body: { perfil: string }) {
    return this.service.updatePerfil(id, body.perfil);
  }
}
