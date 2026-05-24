import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('relatorios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('coordenador')
export class RelatoriosController {
  constructor(private service: RelatoriosService) {}

  @Get('dashboard')
  dashboard() {
    return this.service.dashboard();
  }

  @Get('por-ferramenta')
  porFerramenta(@Query('ferramentaId') ferramentaId?: string) {
    return this.service.porFerramenta(ferramentaId);
  }

  @Get('por-colaborador')
  porColaborador(@Query('responsavelId') responsavelId?: string) {
    return this.service.porColaborador(responsavelId);
  }

  @Get('atrasos')
  atrasos() {
    return this.service.atrasos();
  }

  @Get('por-periodo')
  porPeriodo(@Query('inicio') inicio: string, @Query('fim') fim: string) {
    return this.service.porPeriodo(inicio, fim);
  }
}
