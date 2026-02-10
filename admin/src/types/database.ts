export type UserRole = 'admin' | 'utilisateur';

export interface Utilisateur {
  id: number;
  email: string;
  mot_de_passe_hash: string;
  role: UserRole;
  date_creation: string;
}
