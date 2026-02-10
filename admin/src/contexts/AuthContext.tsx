import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { postgresAuthApi } from '../lib/api';
import type { Utilisateur } from '../types/database';

interface AuthContextType {
  user: Utilisateur | null;
  profile: Utilisateur | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Utilisateur>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [profile, setProfile] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a un utilisateur stocké dans localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setProfile(userData);
      } catch (error) {
        console.error('Erreur lors de la lecture de l\'utilisateur stocké:', error);
      }
    }
    setLoading(false);
  }, []);


  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: authenticatedUser, error } = await postgresAuthApi.authenticateUser(email, password);

      if (error) {
        return { error: new Error(error) };
      }

      if (authenticatedUser) {
        setUser(authenticatedUser);
        setProfile(authenticatedUser);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };


  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: newUser, error } = await postgresAuthApi.createUser(email, password, 'utilisateur');

      if (error) {
        return { error: new Error(error) };
      }

      if (newUser) {
        setUser(newUser);
        setProfile(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (data: Partial<Utilisateur>) => {
    try {
      if (!user) return { error: new Error('No user logged in') };

      // Pour l'instant, nous ne supportons pas la mise à jour du profil
      // Cela nécessiterait une implémentation dans PostgresAuth
      console.log('Mise à jour du profil non implémentée:', data);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
