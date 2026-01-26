export interface Utilisateur {
  userId: string;
  email: string;
  motDePasseHash: string;
  role: 'admin' | 'utilisateur' | 'visiteur';
  dateCreation: Date;
}

export interface RouteEndommagee {
  routeId: string;
  utilisateurId?: string;
  latitude: number;
  longitude: number;
  gravite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  description?: string;
  statut: 'nouveau' | 'verifie' | 'en_cours' | 'termine';
  longueurKm: number;
  surfaceM2?: number;
  budget?: number;
  entreprise?: string;
  dateCreation: Date;
  dateMiseAJour: Date;
}

export interface SignalementHorsLigne {
  signalementId: string;
  idAppareil: string;
  donneesSignalement: any;
  dateCreation: Date;
}
