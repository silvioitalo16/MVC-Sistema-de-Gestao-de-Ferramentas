import { api } from './api';

export interface Perfil {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  ativo: boolean;
}

export const perfisService = {
  findAll(): Promise<Perfil[]> {
    return api.get<Perfil[]>('/perfis');
  },
};
