import React from 'react';
import { Search } from 'lucide-react';

interface FaqBuscadorProps {
  busqueda: string;
  setBusqueda: (valor: string) => void;
}

const FaqBuscador: React.FC<FaqBuscadorProps> = ({ busqueda, setBusqueda }) => {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
        placeholder="Buscar en las preguntas frecuentes..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
    </div>
  );
};

export default FaqBuscador;