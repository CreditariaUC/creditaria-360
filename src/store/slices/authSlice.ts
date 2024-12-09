import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../../types/auth.types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  session: null,
  profile: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
    },
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.profile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.session = null;
      state.profile = null;
      state.error = null;
    },
  },
});

export const { setSession, setProfile, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;