import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItemProps {
  pregunta: string;
  respuesta: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ pregunta, respuesta }) => {
  const [estaAbierto, setEstaAbierto] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full py-5 px-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-lg"
        onClick={() => setEstaAbierto(!estaAbierto)}
      >
        <span className="font-medium text-gray-900 pr-8">{pregunta}</span>
        {estaAbierto ? (
          <ChevronUp className="h-5 w-5 text-primary-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-primary-500 flex-shrink-0" />
        )}
      </button>
      {estaAbierto && (
        <div className="px-4 pb-5">
          <p className="text-gray-600 leading-relaxed">{respuesta}</p>
        </div>
      )}
    </div>
  );
};

export default FaqItem;