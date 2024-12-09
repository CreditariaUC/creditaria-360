import { supabase } from '../lib/supabase';
import type { AuthError, Session, User } from '@supabase/supabase-js';

export const authService = {
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_, session) => {
      callback(session, session?.user ?? null);
    });
  }
};