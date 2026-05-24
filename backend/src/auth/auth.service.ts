import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private toAuthUser(user: {
    id: string;
    nome: string;
    username: string;
    email: string;
    perfil: { id: string; nome: string; slug: string };
  }) {
    return {
      id: user.id,
      nome: user.nome,
      username: user.username,
      email: user.email,
      perfil: user.perfil.slug,
      perfilDetalhe: user.perfil,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        email: dto.email,
      },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });
    if (!user || !user.ativo) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.senha, user.senha);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.jwt.sign({ sub: user.id, username: user.username });

    return {
      access_token: token,
      user: this.toAuthUser(user),
    };
  }

  async me(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });
    return user ? this.toAuthUser(user) : null;
  }

  async forgotPassword(email: string) {
    // Sempre retorna sucesso para não expor quais e-mails estão cadastrados
    await this.prisma.usuario.findUnique({ where: { email } });
    return { message: 'Se o e-mail estiver cadastrado, as instruções foram enviadas.' };
  }

  async impersonate(adminId: string, targetUserId: string) {
    const admin = await this.prisma.usuario.findUnique({
      where: { id: adminId },
      include: { perfil: { select: { slug: true } } },
    });
    if (!admin || !admin.ativo) throw new UnauthorizedException('Administrador inválido');
    if (admin.perfil.slug !== 'admin') throw new ForbiddenException('Apenas administrador pode personificar');

    const targetUser = await this.prisma.usuario.findUnique({
      where: { id: targetUserId },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });
    if (!targetUser || !targetUser.ativo) throw new NotFoundException('Usuário alvo não encontrado ou inativo');

    const token = this.jwt.sign({ sub: targetUser.id, username: targetUser.username });
    return { access_token: token, user: this.toAuthUser(targetUser) };
  }
}
