import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Progress } from '@nextui-org/react';
import { Eye, Play } from 'lucide-react';
import { evaluationService } from '../services/evaluation.service';
import { calculateRemainingDays } from '../utils/dateUtils';
import type { Evaluation } from '../types/evaluation.types';
import toast from 'react-hot-toast';

const MisEvaluaciones: React.FC = () => {
  const navigate = useNavigate();
  const [evaluaciones, setEvaluaciones] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getEvaluations();
      setEvaluaciones(data);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      toast.error('Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'in_progress':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleIniciarEvaluacion = (evaluacionId: string) => {
    // Aquí irá la lógica para iniciar la evaluación
    console.log('Iniciando evaluación:', evaluacionId);
  };

  const handleVerEvaluacion = (evaluacionId: string) => {
    // Aquí irá la lógica para ver el detalle de la evaluación
    console.log('Ver evaluación:', evaluacionId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Mis Evaluaciones</h3>
        <Button 
          color="primary"
          onClick={() => navigate('/crear-evaluacion')}
        >
          Crear Evaluación
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Nombre de la Evaluación</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Progreso General</th>
              <th className="px-4 py-2">Días Restantes</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {evaluaciones.map((evaluacion) => {
              const diasRestantes = calculateRemainingDays(evaluacion.end_date);
              
              return (
                <tr key={evaluacion.id} className="border-b">
                  <td className="px-4 py-2">{evaluacion.title}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      getStatusColor(evaluacion.status)
                    }`}>
                      {evaluacion.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Progress
                      size="sm"
                      value={evaluacion.percentage}
                      color={evaluacion.percentage === 100 ? "success" : "primary"}
                      className="max-w-md"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <span className={`font-medium ${
                      diasRestantes < 0 ? 'text-red-600' :
                      diasRestantes < 3 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {diasRestantes < 0 ? 'Vencida' :
                       diasRestantes === 0 ? 'Hoy' :
                       `${diasRestantes} días`}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => handleVerEvaluacion(evaluacion.id)}
                      >
                        <Eye size={20} />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        color="primary"
                        variant="flat"
                        onClick={() => handleIniciarEvaluacion(evaluacion.id)}
                      >
                        <Play size={20} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MisEvaluaciones;