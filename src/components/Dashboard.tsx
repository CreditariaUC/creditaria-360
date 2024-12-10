import React from 'react';
import MisEvaluaciones from './MisEvaluaciones';
import Evaluaciones from './Evaluaciones';
import MiRetroalimentacion from './MiRetroalimentacion';
import IniciarEvaluacion from './IniciarEvaluacion';
import RendimientoEquipo from './RendimientoEquipo';
import { useAuth } from '../contexts/AuthContext';

interface PropsDashboard {
  menuActivo: string;
}

const Dashboard: React.FC<PropsDashboard> = ({ menuActivo }) => {
  const { profile } = useAuth();

  const renderizarContenido = () => {
    switch (menuActivo) {
      case 'mis-evaluaciones':
        return profile?.role === 'admin' ? <Evaluaciones /> : <MisEvaluaciones />;
      case 'mi-retroalimentacion':
        return <MiRetroalimentacion />;
      case 'iniciar-evaluacion':
        return <IniciarEvaluacion />;
      case 'rendimiento-equipo':
        return <RendimientoEquipo />;
      default:
        return <div>Selecciona un elemento del menú</div>;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        {menuActivo === 'rendimiento-equipo' ? 'Rendimiento' : 
          menuActivo.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </h2>
      {renderizarContenido()}
    </div>
  );
};

export default Dashboard;