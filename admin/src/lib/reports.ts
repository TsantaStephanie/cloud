import type { ReportStatus, ReportPriority } from '../types/database';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface Report {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  status: ReportStatus;
  priority: ReportPriority;
  gravity_level?: number;
  latitude: number;
  longitude: number;
  location_name: string;
  surface_m2?: number;
  budget?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateReportData {
  user_id?: string;
  title: string;
  description: string;
  priority?: ReportPriority;
  latitude: number;
  longitude: number;
  location_name: string;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  status?: ReportStatus;
  priority?: ReportPriority;
  latitude?: number;
  longitude?: number;
  location_name?: string;
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getAllReports(): Promise<Report[]> {
  const response = await apiRequest('/reports');
  return response.data || [];
}

export async function getReportById(reportId: string): Promise<Report | null> {
  try {
    const response = await apiRequest(`/reports/${reportId}`);
    return response.data || null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function getReportsByUserId(userId: string): Promise<Report[]> {
  const response = await apiRequest(`/reports?userId=${userId}`);
  return response.data || [];
}

export async function getReportsByStatus(status: ReportStatus): Promise<Report[]> {
  const response = await apiRequest(`/reports?status=${status}`);
  return response.data || [];
}

export async function createReport(reportData: CreateReportData): Promise<Report> {
  const response = await apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
  return response.data;
}

export async function updateReport(reportId: string, updates: UpdateReportData): Promise<Report> {
  const response = await apiRequest(`/reports/${reportId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

export async function deleteReport(reportId: string): Promise<void> {
  await apiRequest(`/reports/${reportId}`, {
    method: 'DELETE',
  });
}

export async function getReportsStatistics(): Promise<{
  total: number;
  byStatus: Record<ReportStatus, number>;
  byPriority: Record<ReportPriority, number>;
}> {
  const response = await apiRequest('/reports/statistics');
  return response.data;
}
