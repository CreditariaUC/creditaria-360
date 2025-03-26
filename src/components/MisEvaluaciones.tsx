import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Tooltip, Button, Chip, Card, CardBody} from "@nextui-org/react";
import { Eye, Play, SmilePlus } from 'lucide-react';
import { evaluationService } from '../services/evaluation.service';
import { calculateRemainingDays } from '../utils/dateUtils';
import type { Evaluation } from '../types/evaluation.types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ParticipantStatus {
  id: string;
  status: 'pendiente' | 'en_progreso' | 'completado';
}

const MisEvaluaciones: React.FC = () => {
  const navigate = useNavigate();
  const [evaluaciones, setEvaluaciones] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    cargarEvaluaciones();

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
  }, [user]);

  const cargarEvaluaciones = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const allEvaluations = await evaluationService.getEvaluations();
      
      const today = new Date();
today.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00 para comparar solo fechas

const misEvaluaciones = allEvaluations.filter(evaluacion => 
  evaluacion.start_date !== null &&
  new Date(evaluacion.start_date) <= today &&
  evaluacion.participants.some((p: ParticipantStatus) => p.id === user.id)
);
      
      const { data: responsesData, error: responsesError } = await supabase
        .from('evaluation_responses')
        .select('*');

      if (responsesError) throw responsesError;
      setResponses(responsesData || []);

      setEvaluaciones(misEvaluaciones);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      toast.error('Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado':
        return 'success';
      case 'en_progreso':
        return 'warning';
      default:
        return 'warning';
    }
  };

  const getParticipantStatus = (evaluacion: Evaluation) => {
    if (!user) return 'pendiente';

    if (evaluacion.evaluation_type === '360' && evaluacion.evaluated_id === user.id) {
      const completedEvaluations = getCompletedEvaluationsCount(evaluacion.id, user.id);
      const totalRequired = evaluacion.participants.length;
      return completedEvaluations === totalRequired ? 'completado' : 
             completedEvaluations > 0 ? 'en_progreso' : 'pendiente';
    }

    const participant = evaluacion.participants.find((p: ParticipantStatus) => p.id === user.id);
    return participant ? participant.status : 'pendiente';
  };

  const getCompletedEvaluationsCount = (evaluacionId: string, userId: string) => {
    return responses.filter(r => 
      r.evaluation_id === evaluacionId && 
      r.evaluation_participant_id === userId
    ).length;
  };

  const areAllEvaluationsCompleted = () => {
    return evaluaciones.every(evaluacion => 
      getParticipantStatus(evaluacion) === 'completado'
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Mis Evaluaciones</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        {evaluaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <SmilePlus size={48} className="text-gray-400" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No tienes evaluaciones pendientes</h3>
              <p className="text-gray-500">Cuando tengas evaluaciones asignadas, aparecerán aquí.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Nombre de la Evaluación</th>
                  <th className="px-4 py-2">Estado</th>
                  {!areAllEvaluationsCompleted() && (
                    <>
                      <th className="px-4 py-2">Días Restantes</th>
                      <th className="px-4 py-2">Acciones</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {evaluaciones.map((evaluacion) => {
                  const participantStatus = getParticipantStatus(evaluacion);
                  const showButton = participantStatus !== 'completado';
                  const diasRestantes = calculateRemainingDays(evaluacion.end_date);
                  
                  return (
                    <tr key={evaluacion.id} className="border-b">
                      <td className="px-4 py-2">{evaluacion.title}</td>
                      <td className="px-4 py-2">
                        <Chip
                          color={getStatusColor(participantStatus)}
                          variant="flat"
                          size="sm"
                        >
                          {participantStatus}
                        </Chip>
                      </td>
                      {!areAllEvaluationsCompleted() && participantStatus !== 'completado' && (
                        <>
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
                            {showButton && (
                              <Button
                                size="sm"
                                color="primary"
                                variant="ghost"
                                startContent={<Play size={18} />}
                                onClick={() => navigate(`/realizar-evaluacion/${evaluacion.id}`)}
                              >
                                Iniciar Evaluación
                              </Button>
                            )}
                          </td>
                        </>
                      )}
                      {!areAllEvaluationsCompleted() && participantStatus === 'completado' && (
                        <>
                          <td></td>
                          <td></td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisEvaluaciones;