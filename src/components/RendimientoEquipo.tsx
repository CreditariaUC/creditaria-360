import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const RendimientoEquipo: React.FC = () => {
  const datosRendimiento = [
    { nombre: 'Comunicación', AutoEvaluacion: 4.2, promedioTotal: 3.5 },
    { nombre: 'Trabajo en Equipo', AutoEvaluacion: 3.8, promedioTotal: 3.2 },
    { nombre: 'Liderazgo', AutoEvaluacion: 3.5, promedioTotal: 2.9 },
    { nombre: 'Resolución de Problemas', AutoEvaluacion: 4.0, promedioTotal: 3.3 },
    { nombre: 'Adaptabilidad', AutoEvaluacion: 3.9, promedioTotal: 3.1 },
    { nombre: 'Gestión del Tiempo', AutoEvaluacion: 3.6, promedioTotal: 3.0 },
    { nombre: 'Creatividad', AutoEvaluacion: 3.7, promedioTotal: 3.2 },
    { nombre: 'Habilidades Técnicas', AutoEvaluacion: 4.3, promedioTotal: 3.6 },
    { nombre: 'Iniciativa', AutoEvaluacion: 3.4, promedioTotal: 2.8 },
    { nombre: 'Profesionalismo', AutoEvaluacion: 4.5, promedioTotal: 3.8 },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Rendimiento</h3>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={datosRendimiento}>
            <PolarGrid />
            <PolarAngleAxis dataKey="nombre" />
            <PolarRadiusAxis angle={30} domain={[0, 5]} />
            <Radar name="AutoEvaluacion" dataKey="AutoEvaluacion" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name="Percepcion" dataKey="promedioTotal" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Perspectivas de Rendimiento</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Sobresale en Habilidades Técnicas y Profesionalismo.</li>
          <li>Hay margen de mejora en Liderazgo e Iniciativa.</li>
          <li>Se desempeña consistentemente por encima del promedio del departamento.</li>
        </ul>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-700 mb-2">Escala de Evaluación</h5>
          <div className="grid grid-cols-5 gap-4 text-sm text-gray-600">
            <div>1: Nunca</div>
            <div>2: Casi Nunca</div>
            <div>3: Neutro</div>
            <div>4: Casi Siempre</div>
            <div>5: Siempre</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RendimientoEquipo;