import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Progress, Chip, Tooltip, Card, CardBody } from '@nextui-org/react';
import { Eye, Play, Pause, ClipboardList } from 'lucide-react';
import { evaluationService } from '../services/evaluation.service';
import { calculateRemainingDays } from '../utils/dateUtils';
import { calculateEvaluationProgress, determineEvaluationStatus, getStatusColor, getStatusText } from '../utils/evaluationUtils';
import type { Evaluation, ParticipantStatus } from '../types/evaluation.types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Evaluaciones: React.FC = () => {
  const navigate = useNavigate();
  const [evaluaciones, setEvaluaciones] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEvaluaciones();

    // Set up real-time subscription for evaluation updates
    const subscription = supabase
      .channel('evaluations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evaluations'
        },
        () => {
          cargarEvaluaciones();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getEvaluations();
      
      // Get all evaluation responses
      const { data: responses } = await supabase
        .from('evaluation_responses')
        .select('evaluation_id, evaluation_participant_id, evaluated_id');
      
      // Calculate progress and update status for each evaluation
      const updatedEvaluations = data.map(evaluation => {
        const evaluationResponses = responses?.filter(r => r.evaluation_id === evaluation.id) || [];
        const progress = calculateEvaluationProgress(
          evaluation.participants, 
          evaluation.evaluation_type,
          evaluation.evaluated_id,
          evaluationResponses
        );
        const newStatus = determineEvaluationStatus(progress, evaluation.status);
        
        // If status has changed, update it in the database
        if (newStatus !== evaluation.status) {
          updateEvaluationStatus(evaluation.id, newStatus);
        }
        
        return {
          ...evaluation,
          status: newStatus,
          percentage: progress
        };
      });
      
      setEvaluaciones(updatedEvaluations);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      toast.error('Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const updateEvaluationStatus = async (evaluationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('evaluations')
        .update({ status: newStatus })
        .eq('id', evaluationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating evaluation status:', error);
    }
  };

  const handleStartStopEvaluation = async (evaluacion: Evaluation) => {
    try {
      const isStarting = !evaluacion.start_date;
      const { error } = await supabase
        .from('evaluations')
        .update({ 
          start_date: isStarting ? new Date().toISOString() : null,
          status: isStarting ? 'iniciado' : 'detenido'
        })
        .eq('id', evaluacion.id);

      if (error) throw error;
      
      toast.success(isStarting ? 'Evaluación iniciada' : 'Evaluación detenida');
      await cargarEvaluaciones();
    } catch (error) {
      console.error('Error al actualizar la evaluación:', error);
      toast.error('Error al actualizar la evaluación');
    }
  };

  const handleIniciarEvaluacion = (evaluacionId: string) => {
    navigate(`/realizar-evaluacion/${evaluacionId}`);
  };

  const handleVerEvaluacion = (evaluacionId: string) => {
    navigate(`/evaluacion/${evaluacionId}`);
  };

  const getEvaluationType = (type: string) => {
    switch (type) {
      case '360':
        return 'Evaluación 360°';
      case 'simple':
        return 'Evaluación Simple';
      default:
        return 'No definido';
    }
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
        <h3 className="text-xl font-semibold text-gray-800">Evaluaciones</h3>
        <Button 
          color="primary"
          variant="ghost"
          onClick={() => navigate('/crear-evaluacion')}
        >
          Crear Evaluación
        </Button>
      </div>
      {evaluaciones.length === 0 ? (
         <div className="flex flex-col items-center justify-center text-center gap-4">
              <ClipboardList size={48} className="text-gray-400" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay evaluaciones creadas</h3>
                <p className="text-gray-500">Comienza creando una nueva evaluación usando el botón superior.</p>
              </div>
            </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Progreso</th>
              <th className="px-4 py-2"></th>
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
                    <span className="text-sm font-medium text-gray-600">
                      {getEvaluationType(evaluacion.evaluation_type)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Chip
                      color={getStatusColor(evaluacion.status)}
                      variant="flat"
                      size="sm"
                    >
                      {getStatusText(evaluacion.status)}
                    </Chip>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Progress
                        size="sm"
                        value={evaluacion.percentage}
                        color={evaluacion.percentage === 100 ? "success" : "primary"}
                        className="max-w-md"
                      />
                      <span className="text-sm font-medium">
                        {evaluacion.percentage}%
                      </span>
                    </div>
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
                      <Tooltip content="Ver evaluación">
                        <Button
                          isIconOnly
                          size="sm"
                          color="primary"
                          variant="ghost"
                          onClick={() => handleVerEvaluacion(evaluacion.id)}
                        >
                          <Eye size={20} />
                        </Button>
                      </Tooltip>
                      
                      {new Date(evaluacion.end_date) > new Date() && (
                      <Tooltip content={evaluacion.start_date ? "Detener evaluación" : "Iniciar evaluación"}>
                        <Button
                          isIconOnly
                          size="sm"
                          color={evaluacion.start_date ? "danger" : "success"}
                          variant="ghost"
                          onClick={() => handleStartStopEvaluation(evaluacion)}
                        >
                          {evaluacion.start_date ? <Pause size={20} /> : <Play size={20} />}
                        </Button>
                      </Tooltip>
                    )}

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default Evaluaciones;