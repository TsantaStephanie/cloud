// Configuration de l'API backend admin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

// API d'authentification
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: RegisterData): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
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
  auth: authApi,
  reports: reportsApi,
  users: usersApi,
  stats: statsApi,
  health: healthApi,
};
