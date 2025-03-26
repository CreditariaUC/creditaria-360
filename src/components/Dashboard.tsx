import React from 'react';
import Evaluaciones from './Evaluaciones';
import MisEvaluaciones from './MisEvaluaciones';

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
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {renderizarContenido()}
    </div>
  );
};

export default Dashboard;