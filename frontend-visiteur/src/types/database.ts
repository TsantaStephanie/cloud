export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'visitor' | 'user' | 'manager';
export type ReportStatus = 'reported' | 'in_progress' | 'completed' | 'rejected';
export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent';

export type RouteGravite = 'faible' | 'moyenne' | 'elevee' | 'critique';
export type RouteStatut = 'signale' | 'verifie' | 'en_cours' | 'repare';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string;
          status: ReportStatus;
          priority: ReportPriority;
          latitude: number;
          longitude: number;
          location_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          description: string;
          status?: ReportStatus;
          priority?: ReportPriority;
          latitude: number;
          longitude: number;
          location_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          description?: string;
          status?: ReportStatus;
          priority?: ReportPriority;
          latitude?: number;
          longitude?: number;
          location_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      login_attempts: {
        Row: {
          id: string;
          email: string;
          attempt_count: number;
          is_blocked: boolean;
          blocked_until: string | null;
          last_attempt_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          attempt_count?: number;
          is_blocked?: boolean;
          blocked_until?: string | null;
          last_attempt_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          attempt_count?: number;
          is_blocked?: boolean;
          blocked_until?: string | null;
          last_attempt_at?: string;
          created_at?: string;
        };
      };
      routes_endommagees: {
        Row: {
          id: string;
          utilisateur_id: string | null;
          latitude: number;
          longitude: number;
          gravite: RouteGravite;
          description: string;
          statut: RouteStatut;
          longueur_km: number;
          date_creation: string;
          date_mise_a_jour: string;
        };
        Insert: {
          id?: string;
          utilisateur_id?: string | null;
          latitude: number;
          longitude: number;
          gravite: RouteGravite;
          description: string;
          statut?: RouteStatut;
          longueur_km?: number;
          date_creation?: string;
          date_mise_a_jour?: string;
        };
        Update: {
          id?: string;
          utilisateur_id?: string | null;
          latitude?: number;
          longitude?: number;
          gravite?: RouteGravite;
          description?: string;
          statut?: RouteStatut;
          longueur_km?: number;
          date_creation?: string;
          date_mise_a_jour?: string;
        };
      };
      signalements_hors_ligne: {
        Row: {
          id: string;
          id_appareil: string;
          donnees_signalement: Json;
          date_creation: string;
        };
        Insert: {
          id?: string;
          id_appareil: string;
          donnees_signalement: Json;
          date_creation?: string;
        };
        Update: {
          id?: string;
          id_appareil?: string;
          donnees_signalement?: Json;
          date_creation?: string;
        };
      };
    };
  };
}
