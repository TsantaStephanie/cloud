// Configuration de l'API backend admin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

import type { Utilisateur, UserRole } from '../types/database';

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'visitor' | 'user' | 'manager';
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  status: 'reported' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  latitude: number;
  longitude: number;
  location_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportData {
  user_id?: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  latitude: number;
  longitude: number;
  location_name: string;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  status?: 'reported' | 'in_progress' | 'completed' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  latitude?: number;
  longitude?: number;
  location_name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: 'visitor' | 'user' | 'manager';
  phone?: string;
}

// Fonction utilitaire pour les requêtes API
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// API d'authentification PostgreSQL
export const postgresAuthApi = {
  authenticateUser: async (email: string, password: string): Promise<{ user: Utilisateur | null; error: string | null }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      return { user: null, error: 'Email ou mot de passe incorrect' };
    }
  },

  getUserById: async (id: number): Promise<Utilisateur | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  getUserByEmail: async (email: string): Promise<Utilisateur | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  createUser: async (email: string, password: string, role: UserRole = 'utilisateur'): Promise<{ user: Utilisateur | null; error: string | null }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return { user: null, error: 'Erreur lors de la création du compte' };
    }
  },
};

// API des rapports
export const reportsApi = {
  getAll: async (filters?: {
    status?: string;
    priority?: string;
    user_id?: string;
  }): Promise<ApiResponse<Report[]>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.user_id) params.append('user_id', filters.user_id);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Report[]>(`/reports${query}`);
  },

  getById: async (id: string): Promise<ApiResponse<Report>> => {
    return apiRequest<Report>(`/reports/${id}`);
  },

  create: async (reportData: CreateReportData): Promise<ApiResponse<Report>> => {
    return apiRequest<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  update: async (id: string, updates: UpdateReportData): Promise<ApiResponse<Report>> => {
    return apiRequest<Report>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/reports/${id}`, {
      method: 'DELETE',
    });
  },
};

// API des utilisateurs
export const usersApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>('/users');
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${id}`);
  },

  update: async (id: string, updates: Partial<Pick<User, 'full_name' | 'phone'>>): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// API des statistiques
export const statsApi = {
  getReports: async (): Promise<ApiResponse<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }>> => {
    return apiRequest('/stats/reports');
  },
};

// API de santé
export const healthApi = {
  check: async (): Promise<ApiResponse<{
    message: string;
    timestamp: string;
  }>> => {
    return apiRequest('/health');
  },
};

export default {
  auth: postgresAuthApi,
  reports: reportsApi,
  users: usersApi,
  stats: statsApi,
  health: healthApi,
};
