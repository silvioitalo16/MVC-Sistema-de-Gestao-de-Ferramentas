import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router';
import { KeyRound, UserPlus, Users } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import CoordDashboard from './coordenador/CoordDashboard';
import AlmoxDashboard from './almoxarife/AlmoxDashboard';
import TecnicoDashboard from './tecnico/TecnicoDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.perfil === 'admin') {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-7">
            <h1 className="text-2xl font-bold text-slate-900">Administracao</h1>
            <p className="text-sm text-slate-600 mt-2">
              Painel simples para criar usuarios, redefinir senhas e atribuir perfis.
            </p>
            <div className="mt-5">
              <Link to="/usuarios" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Users className="w-4 h-4" />
                Ir para Usuarios
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-slate-800 mt-3">Cadastrar</p>
              <p className="text-xs text-slate-500 mt-1">Crie novos acessos com nome, e-mail e perfil.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-semibold text-slate-800 mt-3">Redefinir senha</p>
              <p className="text-xs text-slate-500 mt-1">Apoie recuperacao de conta em poucos cliques.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <Users className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-800 mt-3">Atribuir perfis</p>
              <p className="text-xs text-slate-500 mt-1">Controle de permissao por perfil de usuario.</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (user?.perfil === 'coordenador') return <CoordDashboard />;
  if (user?.perfil === 'almoxarife') return <AlmoxDashboard />;
  return <TecnicoDashboard />;
}
