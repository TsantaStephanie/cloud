import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { UserRole } from '../types/database';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

// Mock users basés sur votre data.sql
const mockUsers = [
  { id: '1', email: 'admin@routes.fr', password: 'admin123', fullName: 'Admin', role: 'admin' as UserRole },
  { id: '2', email: 'jean@mail.com', password: 'user123', fullName: 'Jean', role: 'utilisateur' as UserRole },
  { id: '3', email: 'visiteur@mail.com', password: 'visitor123', fullName: 'Visiteur', role: 'visiteur' as UserRole }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a un utilisateur stocké dans localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      const mockUser = mockUsers.find(u => u.id === userData.id);
      if (mockUser) {
        setProfile({
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.fullName,
          role: mockUser.role,
          phone: null
        });
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!mockUser) {
        return { error: new Error('Email ou mot de passe incorrect') };
      }

      const userData = { id: mockUser.id, email: mockUser.email };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      setProfile({
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.fullName,
        role: mockUser.role,
        phone: null
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Simulation d'inscription - dans un vrai cas, on ajouterait à la base
      const newUser = {
        id: Date.now().toString(),
        email,
        fullName,
        role: 'visiteur' as UserRole
      };

      const userData = { id: newUser.id, email: newUser.email };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      setProfile({
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.fullName,
        role: newUser.role,
        phone: null
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!profile) return { error: new Error('No user logged in') };

      setProfile({ ...profile, ...data });
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
