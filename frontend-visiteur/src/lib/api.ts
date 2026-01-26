const API_BASE_URL = 'http://localhost:3001/api';

export interface RouteEndommagee {
  id: string;
  utilisateur_id: string | null;
  latitude: number;
  longitude: number;
  gravite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  description: string;
  statut: 'nouveau' | 'verifie' | 'en_cours' | 'termine';
  longueur_km: number;
  surface_m2?: number;
  budget?: number;
  entreprise?: string;
  date_creation: string;
  date_mise_a_jour: string;
}

export const apiService = {
  // Récupérer toutes les routes
  async getRoutes(): Promise<RouteEndommagee[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/routes`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des routes');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // En cas d'erreur, retourner les données mock
      return getMockRoutes();
    }
  },

  // Ajouter une nouvelle route
  async addRoute(route: Omit<RouteEndommagee, 'id' | 'date_creation' | 'date_mise_a_jour'>): Promise<RouteEndommagee> {
    try {
      const response = await fetch(`${API_BASE_URL}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(route),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la route');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Récupérer les utilisateurs
  async getUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  }
};

// Données mock en fallback
function getMockRoutes(): RouteEndommagee[] {
  return [
    {
      id: '1',
      utilisateur_id: '2',
      latitude: -18.8792,
      longitude: 47.5079,
      gravite: 'critique',
      description: 'Grand nid-de-poule avenue de l\'Indépendance',
      statut: 'nouveau',
      longueur_km: 0.05,
      surface_m2: 50,
      budget: 5000,
      entreprise: 'SARL Routes Plus',
      date_creation: new Date().toISOString(),
      date_mise_a_jour: new Date().toISOString()
    },
    {
      id: '2',
      utilisateur_id: '2',
      latitude: -18.9136,
      longitude: 47.5361,
      gravite: 'elevee',
      description: 'Chaussée effondrée à Ambohijanahary',
      statut: 'verifie',
      longueur_km: 0.15,
      surface_m2: 150,
      budget: 15000,
      entreprise: 'Construction Tana',
      date_creation: new Date().toISOString(),
      date_mise_a_jour: new Date().toISOString()
    },
    {
      id: '3',
      utilisateur_id: '1',
      latitude: -18.8667,
      longitude: 47.5167,
      gravite: 'moyenne',
      description: 'Route défoncée à Analakely',
      statut: 'en_cours',
      longueur_km: 0.30,
      surface_m2: 300,
      budget: 25000,
      entreprise: 'BTP Madagascar',
      date_creation: new Date().toISOString(),
      date_mise_a_jour: new Date().toISOString()
    },
    {
      id: '4',
      utilisateur_id: '2',
      latitude: -18.9036,
      longitude: 47.5272,
      gravite: 'faible',
      description: 'Petite fissure route d\'Andrainarivo',
      statut: 'termine',
      longueur_km: 0.02,
      surface_m2: 20,
      budget: 2000,
      entreprise: 'SARL Routes Plus',
      date_creation: new Date().toISOString(),
      date_mise_a_jour: new Date().toISOString()
    },
    {
      id: '5',
      utilisateur_id: '1',
      latitude: -18.8900,
      longitude: 47.5500,
      gravite: 'elevee',
      description: 'Inondation à Andravoahangy',
      statut: 'nouveau',
      longueur_km: 0.80,
      surface_m2: 800,
      budget: 45000,
      entreprise: 'Hydro Services',
      date_creation: new Date().toISOString(),
      date_mise_a_jour: new Date().toISOString()
    }
  ];
}

// ============================================
// SYSTÈME D'ICÔNES PERSONNALISÉES
// ============================================

// Utilitaire pour déterminer l'icône et la couleur en fonction du problème
export const getRouteIcon = (description: string, gravite: string) => {
  const desc = description.toLowerCase();
  
  // Déterminer le type de problème
  let iconType = 'default';
  
  if (desc.includes('nid-de-poule') || desc.includes('nid') || desc.includes('trou')) {
    iconType = 'pothole';
  } else if (desc.includes('effondr') || desc.includes('affaissement')) {
    iconType = 'collapse';
  } else if (desc.includes('fissur') || desc.includes('craquelur')) {
    iconType = 'crack';
  } else if (desc.includes('inond') || desc.includes('eau')) {
    iconType = 'flood';
  } else if (desc.includes('défon') || desc.includes('détérior') || desc.includes('endommag')) {
    iconType = 'damaged';
  } else if (desc.includes('trottoir') || desc.includes('bordur')) {
    iconType = 'damaged'; // Utiliser damaged pour les trottoirs
  }
  
  // Couleurs selon la gravité
  const colors = {
    low: '#10b981',      // vert
    medium: '#f59e0b',   // orange
    high: '#ef4444',     // rouge
    urgent: '#7f1d1d',   // rouge foncé
    faible: '#10b981',   // vert (compatibilité)
    moyenne: '#f59e0b',  // orange (compatibilité)
    elevee: '#ef4444',   // rouge (compatibilité)
    critique: '#7f1d1d'  // rouge foncé (compatibilité)
  };
  
  const color = colors[gravite as keyof typeof colors] || '#6b7280';
  
  // SVG des icônes
  const icons = {
    pothole: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
        <circle cx="16" cy="16" r="5" fill="${color}"/>
        <path d="M 12 12 Q 16 14 20 12" stroke="white" stroke-width="2" fill="none"/>
        <path d="M 12 20 Q 16 18 20 20" stroke="white" stroke-width="2" fill="none"/>
      </svg>
    `,
    collapse: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 8 12 L 24 12 L 20 20 L 12 20 Z" fill="white" opacity="0.9"/>
        <path d="M 10 14 L 14 18 M 18 14 L 22 18" stroke="white" stroke-width="2.5"/>
      </svg>
    `,
    crack: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 16 8 L 14 14 L 18 16 L 14 20 L 16 24" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>
    `,
    flood: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 8 14 Q 10 12 12 14 T 16 14 T 20 14 T 24 14" stroke="white" stroke-width="2" fill="none"/>
        <path d="M 8 18 Q 10 16 12 18 T 16 18 T 20 18 T 24 18" stroke="white" stroke-width="2" fill="none"/>
        <path d="M 8 22 Q 10 20 12 22 T 16 22 T 20 22 T 24 22" stroke="white" stroke-width="2" fill="none"/>
      </svg>
    `,
    damaged: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 16 10 L 18 14 L 22 14 L 19 17 L 20 21 L 16 19 L 12 21 L 13 17 L 10 14 L 14 14 Z" fill="white" opacity="0.9"/>
      </svg>
    `,
    default: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 16 10 L 16 18" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <circle cx="16" cy="22" r="1.5" fill="white"/>
      </svg>
    `
  };
  
  return {
    iconSvg: icons[iconType as keyof typeof icons] || icons.default,
    color,
    iconType
  };
};