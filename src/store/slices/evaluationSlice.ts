import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Evaluation {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
}

interface EvaluationState {
  evaluations: Evaluation[];
  loading: boolean;
  error: string | null;
}

const initialState: EvaluationState = {
  evaluations: [],
  loading: false,
  error: null,
};

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    setEvaluations: (state, action: PayloadAction<Evaluation[]>) => {
      state.evaluations = action.payload;
    },
    addEvaluation: (state, action: PayloadAction<Evaluation>) => {
      state.evaluations.push(action.payload);
    },
    updateEvaluation: (state, action: PayloadAction<Evaluation>) => {
      const index = state.evaluations.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.evaluations[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setEvaluations,
  addEvaluation,
  updateEvaluation,
  setLoading,
  setError,
} = evaluationSlice.actions;
export default evaluationSlice.reducer;