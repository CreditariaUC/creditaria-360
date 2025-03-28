import { supabase } from '../lib/supabase';
import type { CreateEvaluationDTO, Evaluation } from '../types/evaluation.types';

export const evaluationService = {
  async createEvaluation(evaluation: CreateEvaluationDTO): Promise<Evaluation> {
    const { data, error } = await supabase
      .from('evaluations')
      .insert([{
        evaluation_type: evaluation.evaluation_type,
        title: evaluation.title,
        end_date: evaluation.end_date,
        evaluated_id: evaluation.evaluated_id,
        evaluation_criteria: evaluation.evaluation_criteria,
        participants: evaluation.participants
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getEvaluations(): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};