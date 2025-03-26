import type { ParticipantStatus } from '../types/evaluation.types';

export type EvaluationStatus = 'pendiente' | 'iniciado' | 'detenido' | 'completado';

export const calculateEvaluationProgress = (participants: ParticipantStatus[], evaluationType?: string, evaluatedId?: string, responses?: any[]): number => {
  if (!participants.length) return 0;

  if (evaluationType === '180' && evaluatedId) {
    const totalParticipants = participants.length;
    let completedCount = 0;

    // Count completed evaluations from participants
    completedCount += participants.filter(p => p.status === 'completado').length;

    // Count completed evaluations by the evaluated person
    completedCount += participants.filter(p => p.evaluated === 'completado').length;

    // Total required evaluations is 2 times the number of participants (each participant evaluates and gets evaluated)
    return Math.round((completedCount / (totalParticipants * 2)) * 100);
  }

  // For regular evaluations or when not the evaluated user
  const completedCount = participants.filter(p => p.status === 'completado').length;
  return Math.round((completedCount / participants.length) * 100);
};

export const determineEvaluationStatus = (
  progress: number, 
  currentStatus: EvaluationStatus
): EvaluationStatus => {
  if (progress === 100) return 'completado';
  if (progress > 0) return 'iniciado';
  if (currentStatus === 'detenido') return 'detenido';
  return 'pendiente';
};

export const getStatusColor = (status: EvaluationStatus) => {
  switch (status) {
    case 'completado':
      return 'success';
    case 'iniciado':
      return 'primary';
    case 'detenido':
      return 'danger';
    default:
      return 'warning';
  }
};

export const getStatusText = (status: EvaluationStatus) => {
  switch (status) {
    case 'completado':
      return 'Completado';
    case 'iniciado':
      return 'Iniciado';
    case 'detenido':
      return 'Detenido';
    default:
      return 'Pendiente';
  }
};