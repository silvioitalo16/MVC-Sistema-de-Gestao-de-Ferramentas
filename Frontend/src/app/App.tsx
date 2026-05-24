import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '../contexts/AuthContext';
import PrivateRoute from '../components/layout/PrivateRoute';

import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import MinhasSolicitacoesPage from '../pages/tecnico/MinhasSolicitacoesPage';
import CatalogoPage from '../pages/CatalogoPage';
import EmprestimosPage from '../pages/EmprestimosPage';
import SolicitacoesPage from '../pages/SolicitacoesPage';
import DisponibilidadePage from '../pages/DisponibilidadePage';
import HistoricoPage from '../pages/HistoricoPage';
import RelatoriosPage from '../pages/RelatoriosPage';
import UsuariosPage from '../pages/coordenador/UsuariosPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />

          {/* Rotas autenticadas */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/minhas-solicitacoes" element={<PrivateRoute roles={['tecnico']}><MinhasSolicitacoesPage /></PrivateRoute>} />
          <Route path="/catalogo" element={<PrivateRoute roles={['almoxarife']}><CatalogoPage /></PrivateRoute>} />
          <Route path="/disponibilidade" element={<PrivateRoute roles={['tecnico', 'coordenador']}><DisponibilidadePage /></PrivateRoute>} />
          <Route path="/historico" element={<PrivateRoute roles={['coordenador']}><HistoricoPage /></PrivateRoute>} />

          {/* Rotas de almoxarife/coordenador */}
          <Route path="/emprestimos" element={<PrivateRoute roles={['tecnico', 'almoxarife']}><EmprestimosPage /></PrivateRoute>} />
          <Route path="/solicitacoes" element={<PrivateRoute roles={['almoxarife', 'coordenador']}><SolicitacoesPage /></PrivateRoute>} />
          <Route path="/relatorios" element={<PrivateRoute roles={['coordenador']}><RelatoriosPage /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute roles={['admin']}><UsuariosPage /></PrivateRoute>} />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
