import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FeramentasModule } from './ferramentas/ferramentas.module';
import { EmprestimosModule } from './emprestimos/emprestimos.module';
import { SolicitacoesModule } from './solicitacoes/solicitacoes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { PerfisModule } from './perfis/perfis.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    FeramentasModule,
    EmprestimosModule,
    SolicitacoesModule,
    UsuariosModule,
    RelatoriosModule,
    PerfisModule,
  ],
})
export class AppModule {}
