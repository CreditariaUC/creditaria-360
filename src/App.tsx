import React from 'react';
import { ClipboardPenLine, HelpCircle, ClipboardList } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EnviarCampana from './components/EnviarCampana';
import Faq from './components/Faq/Faq';
import AuthContainer from './components/Auth/AuthContainer';
import PasswordReset from './components/Auth/PasswordReset';
import CrearNuevaEvaluacion from './components/CrearNuevaEvaluacion';
import VerEvaluacion from './components/VerEvaluacion';
import RealizarEvaluacion from './components/Evaluacion/RealizarEvaluacion';
import Evaluacion360 from './components/Evaluacion/Evaluacion360';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { session, profile, loading } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { 
        id: 'mis-evaluaciones', 
        etiqueta: 'Mis Evaluaciones', 
        icono: <ClipboardPenLine size={20} />,
        ruta: '/mis-evaluaciones'
      },
      { 
        id: 'faq', 
        etiqueta: 'Ayuda', 
        icono: <HelpCircle size={20} />,
        ruta: '/faq'
      },
    ];

    if (profile?.role === 'admin') {
      return [
        { 
          id: 'evaluaciones', 
          etiqueta: 'Evaluaciones', 
          icono: <ClipboardList size={20} />,
          ruta: '/evaluaciones'
        },
        ...baseItems,
      ];
    }

    return baseItems;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const renderAuthenticatedLayout = (children: React.ReactNode) => (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar elementosMenu={getMenuItems()} />
      <div className="flex-1">
        <Header session={session} />
        <main className="p-6 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password" element={<PasswordReset />} />
        
        {/* Protected Admin Routes */}
        <Route path="/evaluaciones" element={
          <ProtectedRoute requireAdmin>
            {renderAuthenticatedLayout(<Dashboard menuActivo="evaluaciones" />)}
          </ProtectedRoute>
        } />
        <Route path="/crear-evaluacion" element={
          <ProtectedRoute requireAdmin>
            {renderAuthenticatedLayout(<CrearNuevaEvaluacion />)}
          </ProtectedRoute>
        } />
        <Route path="/evaluacion/:id" element={
          <ProtectedRoute requireAdmin>
            {renderAuthenticatedLayout(<VerEvaluacion />)}
          </ProtectedRoute>
        } />

        {/* Protected User Routes */}
        <Route path="/mis-evaluaciones" element={
          <ProtectedRoute>
            {renderAuthenticatedLayout(<Dashboard menuActivo="mis-evaluaciones" />)}
          </ProtectedRoute>
        } />
        <Route path="/realizar-evaluacion/:id" element={
          <ProtectedRoute>
            {renderAuthenticatedLayout(<RealizarEvaluacion />)}
          </ProtectedRoute>
        } />
        <Route path="/evaluacion-360/:id" element={
          <ProtectedRoute>
            {renderAuthenticatedLayout(<Evaluacion360 />)}
          </ProtectedRoute>
        } />
        <Route path="/faq" element={
          <ProtectedRoute>
            {renderAuthenticatedLayout(<Faq />)}
          </ProtectedRoute>
        } />

        {/* Public Routes */}
        <Route
          path="/"
          element={
            !session ? (
              <AuthContainer />
            ) : (
              <Navigate to={profile?.role === 'admin' ? '/evaluaciones' : '/mis-evaluaciones'} replace />
            )
          }
        />
        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
};

export default App;