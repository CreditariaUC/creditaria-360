import React from 'react';
import Evaluaciones from './Evaluaciones';
import MisEvaluaciones from './MisEvaluaciones';
import MiRetroalimentacion from './MiRetroalimentacion';
import IniciarEvaluacion from './IniciarEvaluacion';
import RendimientoEquipo from './RendimientoEquipo';

interface PropsDashboard {
  menuActivo: string;
}

const Dashboard: React.FC<PropsDashboard> = ({ menuActivo }) => {
  const renderizarContenido = () => {
    switch (menuActivo) {
      case 'evaluaciones':
        return <Evaluaciones />;
      case 'mis-evaluaciones':
        return <MisEvaluaciones />;
      case 'mi-retroalimentacion':
        return <MiRetroalimentacion />;
      case 'iniciar-evaluacion':
        return <IniciarEvaluacion />;
      case 'rendimiento-equipo':
        return <RendimientoEquipo />;
      default:
        return <div> </div>;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {renderizarContenido()}
    </div>
  );
};

export default Dashboard;