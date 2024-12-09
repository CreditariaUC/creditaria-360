import React from 'react';
import { MessageSquare } from 'lucide-react';

const MiRetroalimentacion: React.FC = () => {
  const retroalimentaciones = [
    { id: 1, de: 'Ana García', fecha: '2023-03-15', resumen: 'Excelentes habilidades de liderazgo' },
    { id: 2, de: 'Carlos Rodríguez', fecha: '2023-03-10', resumen: 'Buena capacidad para resolver problemas' },
    { id: 3, de: 'María López', fecha: '2023-03-05', resumen: 'Fuertes habilidades de comunicación' },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Mi Retroalimentación</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300">
          Ver Todas
        </button>
      </div>
      <div className="space-y-4">
        {retroalimentaciones.map((retroalimentacion) => (
          <div key={retroalimentacion.id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">{retroalimentacion.de}</span>
              <span className="text-sm text-gray-500">{retroalimentacion.fecha}</span>
            </div>
            <p className="text-gray-600">{retroalimentacion.resumen}</p>
            <button className="mt-2 text-indigo-600 hover:text-indigo-800 flex items-center">
              <MessageSquare size={16} className="mr-1" />
              <span>Leer Retroalimentación Completa</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiRetroalimentacion;