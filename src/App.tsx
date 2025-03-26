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
        <Route path="/crear-evaluacion" element={
          session ? renderAuthenticatedLayout(<CrearNuevaEvaluacion />) : <AuthContainer />
        } />
        <Route path="/evaluacion/:id" element={
          session ? renderAuthenticatedLayout(<VerEvaluacion />) : <AuthContainer />
        } />
        <Route path="/realizar-evaluacion/:id" element={
          session ? renderAuthenticatedLayout(<RealizarEvaluacion />) : <AuthContainer />
        } />
        <Route path="/evaluacion-360/:id" element={
          session ? renderAuthenticatedLayout(<Evaluacion360 />) : <AuthContainer />
        } />
        <Route path="/evaluaciones" element={
          session ? renderAuthenticatedLayout(<Dashboard menuActivo="evaluaciones" />) : <AuthContainer />
        } />
        <Route path="/mis-evaluaciones" element={
          session ? renderAuthenticatedLayout(<Dashboard menuActivo="mis-evaluaciones" />) : <AuthContainer />
        } />
        <Route path="/faq" element={
          session ? renderAuthenticatedLayout(<Faq />) : <AuthContainer />
        } />
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