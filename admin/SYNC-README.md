# Synchronisation Admin ↔ Backend-Visiteur

## 🔄 Fonctionnalité
Synchronisation bidirectionnelle entre PostgreSQL (admin) et Firebase (visiteur).

## 🏗️ Architecture
- **Admin**: `src/lib/sync.ts` + composant Admin
- **Backend**: `VisitorController.java` + `FirebaseService.java`

## 📊 Flux de données
1. **Import**: Visiteur → Admin (GET `/api/visitor/reports`)
2. **Export**: Admin → Visiteur (POST `/api/visitor/sync/reports`)

## 🔄 Mapping
| Admin | Visiteur |
|-------|----------|
| urgent/high | critique |
| medium | moyenne |
| low | faible |

| Admin | Visiteur |
|-------|----------|
| reported | signale |
| in_progress | verifie |
| completed | traite |
| rejected | signale |

## 🚀 Utilisation
1. Démarrer les deux services
2. Cliquer sur "Synchroniser" dans l'admin
3. Voir les résultats dans le modal

## 🔧 Configuration
```env
VITE_BACKEND_VISITEUR_URL=http://localhost:8080
```

## 📈 Fonctionnalités
- Indicateurs de connexion (vert/rouge)
- Statistiques de synchronisation
- Gestion des erreurs
- Détection des doublons
