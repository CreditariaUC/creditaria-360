import React from 'react';

interface FaqCategoriaProps {
  titulo: string;
  children: React.ReactNode;
}

const FaqCategoria: React.FC<FaqCategoriaProps> = ({ titulo, children }) => {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{titulo}</h3>
      <div className="bg-white rounded-lg divide-y divide-gray-200">
        {children}
      </div>
    </div>
  );
};

export default FaqCategoria;