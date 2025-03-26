export type EvaluationType = '180' | 'simple';

export interface ParticipantStatus {
  id: string;
  status: 'pendiente' | 'en_progreso' | 'completado';
  evaluated?: 'pendiente' | 'completado';
}

export interface Evaluation {
  id: string;
  evaluation_type: EvaluationType;
  title: string;
  end_date: string;
  evaluated_id: string;
  evaluation_criteria: string[];
  participants: ParticipantStatus[];
  status: 'pendiente' | 'iniciado' | 'detenido' | 'completado';
  percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEvaluationDTO {
  evaluation_type: EvaluationType;
  title: string;
  end_date: string;
  evaluated_id: string;
  evaluation_criteria: string[];
  participants: ParticipantStatus[];
}