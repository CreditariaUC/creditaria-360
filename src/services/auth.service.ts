import { supabase } from '../lib/supabase';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { store } from '../store';
import { resetAuth } from '../store/slices/authSlice';
import { resetEvaluation } from '../store/slices/evaluationSlice';
import { resetUI } from '../store/slices/uiSlice';
import { resetNotification } from '../store/slices/notificationSlice';

export const authService = {
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    // Reset all Redux states first
    store.dispatch(resetAuth());
    store.dispatch(resetEvaluation());
    store.dispatch(resetUI());
    store.dispatch(resetNotification());
    
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_, session) => {
      callback(session, session?.user ?? null);
    });
  }
};