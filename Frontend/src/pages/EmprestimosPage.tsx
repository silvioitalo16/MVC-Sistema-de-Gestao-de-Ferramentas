import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { emprestimosService, Emprestimo } from '../services/emprestimos.service';
import { ferramentasService, Ferramenta } from '../services/ferramentas.service';
import { usuariosService, UsuarioLista } from '../services/usuarios.service';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import { toast } from 'sonner';

const statusConfig: Record<string, string> = {
  ativo: 'bg-blue-100 text-blue-700',
  atrasado: 'bg-red-100 text-red-700',
  devolvido: 'bg-green-100 text-green-700',
};

export default function EmprestimosPage() {
  const { user } = useAuth();
  const canOperate = user?.perfil === 'tecnico' || user?.perfil === 'almoxarife';
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [form, setForm] = useState({ ferramentaId: '', responsavelId: '', setor: '', dataDevolucaoPrevista: '', observacoes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      emprestimosService.findAll({ status: filterStatus !== 'todos' ? filterStatus : undefined }),
      ferramentasService.findAll({ estado: 'disponivel' }),
      usuariosService.findAll(),
    ])
      .then(([emp, fer, usr]) => { setEmprestimos(emp); setFerramentas(fer); setUsuarios(usr); })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handleDevolver = async (id: string) => {
    try {
      await emprestimosService.devolver(id);
      toast.success('Devolução registrada');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await emprestimosService.create({ ...form });
      toast.success('Empréstimo registrado');
      setShowForm(false);
      setForm({ ferramentaId: '', responsavelId: '', setor: '', dataDevolucaoPrevista: '', observacoes: '' });
      load();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Empréstimos</h1>
          {canOperate && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Registrar Empréstimo
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {['todos', 'ativo', 'atrasado', 'devolvido'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ferramenta</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Responsável</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Retirada</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Devolução Real</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {emprestimos.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum empréstimo encontrado</td></tr>
                ) : emprestimos.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{e.ferramenta.nome}</p>
                      <p className="text-xs text-gray-400">{e.ferramenta.codigo}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.responsavel.nome}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(e.dataRetirada).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {e.dataDevolucaoReal ? new Date(e.dataDevolucaoReal).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[e.status]}`}>
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canOperate && e.status !== 'devolvido' && (
                        <button onClick={() => handleDevolver(e.id)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Registrar Empréstimo</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ferramenta *</label>
                <select value={form.ferramentaId} onChange={set('ferramentaId')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Selecione...</option>
                  {ferramentas.map((f) => <option key={f.id} value={f.id}>{f.codigo} — {f.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Responsável *</label>
                <select value={form.responsavelId} onChange={set('responsavelId')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Selecione...</option>
                  {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Setor</label>
                <input value={form.setor} onChange={set('setor')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Previsão de Devolução *</label>
                <input type="date" value={form.dataDevolucaoPrevista} onChange={set('dataDevolucaoPrevista')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={set('observacoes')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">{saving ? 'Salvando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
