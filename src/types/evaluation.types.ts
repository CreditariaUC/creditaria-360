export type EvaluationType = '180' | 'simple';

export interface Evaluation {
  id: string;
  evaluation_type: EvaluationType;
  title: string;
  end_date: string;
  evaluated_id: string;
  evaluation_criteria: string[];
  participants: string[];
  status: 'pending' | 'in_progress' | 'completed';
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
  participants: string[];
}