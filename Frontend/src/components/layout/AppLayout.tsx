import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  BarChart3,
  CornerUpLeft,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const perfilLabel: Record<string, string> = {
  admin: 'Administrador',
  coordenador: 'Coordenador',
  almoxarife: 'Almoxarife',
  tecnico: 'Tecnico',
};

const navPorPerfil: Record<string, Array<{ to: string; label: string; icon: any }>> = {
  admin: [
    { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { to: '/usuarios', label: 'Usuarios', icon: Users },
  ],
  tecnico: [
    { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { to: '/disponibilidade', label: 'Disponibilidade', icon: Search },
    { to: '/emprestimos', label: 'Emprestimos', icon: ClipboardList },
  ],
  almoxarife: [
    { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { to: '/catalogo', label: 'Catalogo', icon: Package },
    { to: '/emprestimos', label: 'Emprestimos', icon: ClipboardList },
  ],
  coordenador: [
    { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { to: '/disponibilidade', label: 'Disponibilidade', icon: Search },
    { to: '/historico', label: 'Historico', icon: History },
    { to: '/relatorios', label: 'Relatorios', icon: BarChart3 },
  ],
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isImpersonating, returnToAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user ? navPorPerfil[user.perfil] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">Controle de Ferramentas</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Sair">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {isImpersonating && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
          <span>Voce esta personificando um usuario.</span>
          <button onClick={returnToAdmin} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded-md font-medium">
            <CornerUpLeft className="w-3.5 h-3.5" /> Voltar para admin
          </button>
        </div>
      )}

      <div className="md:grid md:grid-cols-[240px_1fr]">
        <aside className="hidden md:flex md:flex-col md:min-h-screen bg-white border-r border-slate-200">
          <div className="px-5 py-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm leading-none">Controle de Ferramentas</p>
                <p className="text-xs text-slate-500 mt-1">Painel operacional</p>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-800 truncate">{user?.nome}</p>
            <p className="text-xs text-slate-500">{user ? perfilLabel[user.perfil] : ''}</p>
            <button onClick={handleLogout} className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
            {isImpersonating && (
              <button onClick={returnToAdmin} className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 border border-amber-300 bg-amber-50 rounded-lg text-sm text-amber-800 hover:bg-amber-100 transition-colors">
                <CornerUpLeft className="w-4 h-4" />
                Voltar para admin
              </button>
            )}
          </div>
        </aside>

        <main className="p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}
