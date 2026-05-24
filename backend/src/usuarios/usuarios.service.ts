import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  private async buildUsernameFromEmail(email: string) {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'user';
    let username = base;
    let suffix = 1;
    while (await this.prisma.usuario.findUnique({ where: { username } })) {
      username = `${base}${suffix}`;
      suffix += 1;
    }
    return username;
  }

  private mapUsuario(u: any) {
    return {
      id: u.id,
      nome: u.nome,
      username: u.username,
      email: u.email,
      perfil: u.perfil.slug,
      perfilDetalhe: u.perfil,
      createdAt: u.createdAt,
    };
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany({
      where: { ativo: true },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
      orderBy: { nome: 'asc' },
    });
    return users.map((u) => this.mapUsuario(u));
  }

  async findOne(id: string) {
    const u = await this.prisma.usuario.findUnique({
      where: { id },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    return this.mapUsuario(u);
  }

  async findByPerfil(perfil: string) {
    const users = await this.prisma.usuario.findMany({
      where: { perfil: { slug: perfil }, ativo: true },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
      orderBy: { nome: 'asc' },
    });
    return users.map((u) => this.mapUsuario(u));
  }

  async create(dto: RegisterDto) {
    const exists = await this.prisma.usuario.findFirst({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const perfil = await this.prisma.perfil.findUnique({ where: { slug: dto.perfil } });
    if (!perfil || !perfil.ativo) throw new NotFoundException('Perfil não encontrado ou inativo');

    const username = await this.buildUsernameFromEmail(dto.email);
    const hash = await bcrypt.hash(dto.senha, 10);
    const user = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        username,
        email: dto.email,
        senha: hash,
        perfilId: perfil.id,
      },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });

    return this.mapUsuario(user);
  }

  async updatePerfil(id: string, perfilSlug: string) {
    await this.findOne(id);
    const perfil = await this.prisma.perfil.findUnique({ where: { slug: perfilSlug } });
    if (!perfil || !perfil.ativo) throw new NotFoundException('Perfil não encontrado ou inativo');

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { perfilId: perfil.id },
      include: { perfil: { select: { id: true, nome: true, slug: true } } },
    });
    return this.mapUsuario(updated);
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      select: { id: true, nome: true, ativo: true },
    });
  }

  async resetPassword(id: string, novaSenha: string) {
    await this.findOne(id);
    const hash = await bcrypt.hash(novaSenha, 10);
    await this.prisma.usuario.update({ where: { id }, data: { senha: hash } });
    return { message: 'Senha redefinida com sucesso' };
  }
}
