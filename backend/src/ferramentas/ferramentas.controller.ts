import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FeramentasService } from './ferramentas.service';
import { CreateFerramentaDto } from './dto/create-ferramenta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EstadoFerramenta } from '@prisma/client';

@Controller('ferramentas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeramentasController {
  constructor(private service: FeramentasService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoria') categoria?: string,
    @Query('estado') estado?: string,
  ) {
    return this.service.findAll({ search, categoria, estado });
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('categorias')
  categorias() {
    return this.service.categorias();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('almoxarife')
  create(@Body() dto: CreateFerramentaDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Roles('almoxarife')
  update(@Param('id') id: string, @Body() dto: Partial<CreateFerramentaDto>) {
    return this.service.update(id, dto);
  }

  @Patch(':id/estado')
  @Roles('almoxarife')
  updateEstado(@Param('id') id: string, @Body('estado') estado: EstadoFerramenta) {
    return this.service.updateEstado(id, estado);
  }

  @Delete(':id')
  @Roles('almoxarife')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
