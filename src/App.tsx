import React from 'react';
import { Users, UserCircle, PieChart, ClipboardList, MessageSquare, PlayCircle, Mail, HelpCircle } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EnviarCampana from './components/EnviarCampana';
import Faq from './components/Faq/Faq';
import AuthContainer from './components/Auth/AuthContainer';
import PasswordReset from './components/Auth/PasswordReset';
import CrearNuevaEvaluacion from './components/CrearNuevaEvaluacion';
import VerEvaluacion from './components/VerEvaluacion';
import { useAuth } from './contexts/AuthContext';
import { useAppSelector } from './hooks/useAppSelector';

const App: React.FC = () => {
  const menuActivo = useAppSelector(state => state.ui.activeMenu);
  const { session, profile, loading } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'mis-evaluaciones', etiqueta: 'Mis Evaluaciones', icono: <ClipboardList size={20} /> },
      { id: 'mi-retroalimentacion', etiqueta: 'Mi Retroalimentación', icono: <MessageSquare size={20} /> },
      { id: 'rendimiento-equipo', etiqueta: 'Rendimiento', icono: <PieChart size={20} /> },
      { id: 'faq', etiqueta: 'Ayuda', icono: <HelpCircle size={20} /> },
    ];

    if (profile?.role === 'admin') {
      return [
        ...baseItems,
        { id: 'iniciar-evaluacion', etiqueta: 'Iniciar Nueva Evaluación', icono: <PlayCircle size={20} /> },
        { id: 'enviar-campana', etiqueta: 'Enviar Campaña', icono: <Mail size={20} /> },
      ];
    }

    return baseItems;
  };

  const renderizarContenido = () => {
    if ((menuActivo === 'iniciar-evaluacion' || menuActivo === 'enviar-campana') && profile?.role !== 'admin') {
      return <Dashboard menuActivo="mis-evaluaciones" />;
    }

    switch (menuActivo) {
      case 'enviar-campana':
        return <EnviarCampana />;
      case 'faq':
        return <Faq />;
      default:
        return <Dashboard menuActivo={menuActivo} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/crear-evaluacion" element={
          session ? (
            <div className="flex h-screen bg-gray-100">
              <Sidebar 
                elementosMenu={getMenuItems()} 
                menuActivo={menuActivo}
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Header session={session} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                  <CrearNuevaEvaluacion />
                </main>
              </div>
            </div>
          ) : <AuthContainer />
        } />
        <Route path="/evaluacion/:id" element={
          session ? (
            <div className="flex h-screen bg-gray-100">
              <Sidebar 
                elementosMenu={getMenuItems()} 
                menuActivo={menuActivo}
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Header session={session} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                  <VerEvaluacion />
                </main>
              </div>
            </div>
          ) : <AuthContainer />
        } />
        <Route
          path="/*"
          element={
            !session ? (
              <AuthContainer />
            ) : (
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  elementosMenu={getMenuItems()} 
                  menuActivo={menuActivo}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <Header session={session} />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                    {renderizarContenido()}
                  </main>
                </div>
              </div>
            )
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
};

export default App;