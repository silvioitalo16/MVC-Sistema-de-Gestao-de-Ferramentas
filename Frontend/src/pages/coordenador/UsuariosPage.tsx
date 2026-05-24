import { useEffect, useState } from 'react';
import { KeyRound, LogIn, UserPlus, Users, UserX } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '../../components/layout/AppLayout';
import { perfisService, Perfil } from '../../services/perfis.service';
import { usuariosService, UsuarioLista } from '../../services/usuarios.service';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';

const perfilColor: Record<string, string> = {
  admin: 'bg-gray-900 text-white',
  coordenador: 'bg-purple-100 text-purple-700',
  almoxarife: 'bg-blue-100 text-blue-700',
  tecnico: 'bg-green-100 text-green-700',
};

const initialForm = {
  nome: '',
  email: '',
  senha: '',
  perfil: '',
};

export default function UsuariosPage() {
  const { user, impersonate } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [resetando, setResetando] = useState<UsuarioLista | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [saving, setSaving] = useState(false);

  const perfilNome = (slug: string) => perfis.find((p) => p.slug === slug)?.nome || slug;

  const load = () => {
    setLoading(true);
    Promise.all([usuariosService.findAll(), perfisService.findAll()])
      .then(([usuariosData, perfisData]) => {
        setUsuarios(usuariosData);
        setPerfis(perfisData);
        setForm((prev) => ({ ...prev, perfil: prev.perfil || perfisData[0]?.slug || '' }));
      })
      .catch(() => toast.error('Erro ao carregar usuários'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await usuariosService.create(form);
      toast.success(`Usuário ${form.nome} cadastrado`);
      setForm({ ...initialForm, perfil: perfis[0]?.slug || '' });
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar usuário');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePerfil = async (u: UsuarioLista, perfil: string) => {
    try {
      await usuariosService.updatePerfil(u.id, perfil);
      toast.success(`Perfil de ${u.nome} atualizado`);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar perfil');
    }
  };

  const handleReset = async () => {
    if (!resetando || !novaSenha.trim()) return;
    setSaving(true);
    try {
      await usuariosService.resetPassword(resetando.id, novaSenha);
      toast.success(`Senha de ${resetando.nome} redefinida`);
      setResetando(null);
      setNovaSenha('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDesativar = async (u: UsuarioLista) => {
    if (!confirm(`Desativar o usuário "${u.nome}"?`)) return;
    try {
      await usuariosService.deactivate(u.id);
      toast.success(`${u.nome} desativado`);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleImpersonate = async (u: UsuarioLista) => {
    try {
      await impersonate(u.id);
      toast.success(`Agora voce esta como ${u.nome}`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao personificar usuario');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Usuários</h1>
        </div>

        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
            <input value={form.nome} onChange={set('nome')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
            <input type="email" value={form.email} onChange={set('email')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Senha inicial</label>
            <input type="password" value={form.senha} onChange={set('senha')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Perfil</label>
            <select value={form.perfil} onChange={set('perfil')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
              {perfis.map((perfil) => <option key={perfil.id} value={perfil.slug}>{perfil.nome}</option>)}
            </select>
          </div>
          <button type="submit" disabled={creating || perfis.length === 0} className="md:col-span-5 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            <UserPlus className="w-4 h-4" /> {creating ? 'Cadastrando...' : 'Cadastrar usuário'}
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">E-mail</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Perfil</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhum usuário encontrado</td></tr>
                ) : usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.nome}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${perfilColor[u.perfil] || 'bg-gray-100 text-gray-700'}`}>
                          {perfilNome(u.perfil)}
                        </span>
                        <select value={u.perfil} onChange={(e) => handleUpdatePerfil(u, e.target.value)} className="px-2 py-1 border border-gray-300 rounded-lg text-xs">
                          {perfis.map((perfil) => <option key={perfil.id} value={perfil.slug}>{perfil.nome}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setResetando(u); setNovaSenha(''); }} className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg hover:bg-amber-200 transition-colors" title="Redefinir senha">
                          <KeyRound className="w-3.5 h-3.5" /> Redefinir senha
                        </button>
                        {user?.id !== u.id && (
                          <button onClick={() => handleImpersonate(u)} className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg hover:bg-indigo-200 transition-colors" title="Entrar como usuário">
                            <LogIn className="w-3.5 h-3.5" /> Entrar como
                          </button>
                        )}
                        <button onClick={() => handleDesativar(u)} className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-200 transition-colors" title="Desativar usuário">
                          <UserX className="w-3.5 h-3.5" /> Desativar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {resetando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Redefinir Senha</h2>
            <p className="text-sm text-gray-500 mb-4">Usuário: <strong>{resetando.nome}</strong></p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
                <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setResetando(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button onClick={handleReset} disabled={saving || !novaSenha.trim()} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
