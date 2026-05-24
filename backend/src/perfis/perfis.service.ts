import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PerfisService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.perfil.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, slug: true, descricao: true, ativo: true, createdAt: true },
    });
  }

  async create(data: { nome: string; slug: string; descricao?: string }) {
    const slug = data.slug.trim().toLowerCase();
    if (!slug.match(/^[a-z0-9-]+$/)) {
      throw new BadRequestException('Slug deve conter apenas letras minúsculas, números e hífen');
    }

    return this.prisma.perfil.create({
      data: { nome: data.nome, slug, descricao: data.descricao },
      select: { id: true, nome: true, slug: true, descricao: true, ativo: true, createdAt: true },
    });
  }

  async update(id: string, data: { nome?: string; descricao?: string; ativo?: boolean }) {
    const exists = await this.prisma.perfil.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Perfil não encontrado');

    return this.prisma.perfil.update({
      where: { id },
      data,
      select: { id: true, nome: true, slug: true, descricao: true, ativo: true, createdAt: true },
    });
  }
}
