import React, { createContext, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import type { Profile } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { setSession, setProfile, setLoading, setError } from '../store/slices/authSlice';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { session, user, profile, loading } = useAppSelector(state => state.auth);

  const loadProfile = async (userId: string) => {
    try {
      const profile = await profileService.getProfile(userId);
      if (profile) {
        dispatch(setProfile(profile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      dispatch(setProfile(null));
      dispatch(setError('Error loading profile'));
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const initialSession = await authService.getSession();
        
        if (!mounted) return;

        if (initialSession) {
          dispatch(setSession(initialSession));
          await loadProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        dispatch(setError('Error during initialization'));
      } finally {
        if (mounted) {
          dispatch(setLoading(false));
        }
      }
    };

    initialize();

    const { data: { subscription } } = authService.onAuthStateChange(async (session, user) => {
      if (!mounted) return;

      dispatch(setSession(session));

      if (user) {
        await loadProfile(user.id);
      } else {
        dispatch(setProfile(null));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};