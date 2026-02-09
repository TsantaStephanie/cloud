# Backend API - Admin Dashboard

API REST pour l'interface admin du projet Cloud.

## 🚀 Démarrage

### Installation
```bash
cd backend-admin
npm install
```

### Configuration
```bash
cp .env.example .env
# Modifier les variables si nécessaire
```

### Démarrage
```bash
# Développement
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

### Rapports
- `GET /api/reports` - Lister tous les rapports
- `GET /api/reports/:id` - Détails d'un rapport
- `POST /api/reports` - Créer un rapport
- `PUT /api/reports/:id` - Mettre à jour un rapport
- `DELETE /api/reports/:id` - Supprimer un rapport

### Utilisateurs
- `GET /api/users` - Lister tous les utilisateurs
- `GET /api/users/:id` - Détails d'un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur

### Statistiques
- `GET /api/stats/reports` - Statistiques des rapports

### Santé
- `GET /api/health` - Vérifier le statut du serveur

## 🔧 Configuration

### Variables d'environnement
- `PORT` - Port du serveur (défaut: 3001)
- `POSTGRES_HOST` - Hôte PostgreSQL
- `POSTGRES_PORT` - Port PostgreSQL
- `POSTGRES_DB` - Nom de la base de données
- `POSTGRES_USER` - Utilisateur PostgreSQL
- `POSTGRES_PASSWORD` - Mot de passe PostgreSQL

## 🛡️ Sécurité

- CORS configuré pour localhost:5173 et localhost:3000
- Rate limiting (100 requêtes/15 minutes)
- Helmet pour la sécurité des headers
- Bcrypt pour le hashage des mots de passe

## 📝 Exemples d'utilisation

### Connexion
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cloud.com", "password": "admin123"}'
```

### Lister les rapports
```bash
curl http://localhost:3001/api/reports
```

### Créer un rapport
```bash
curl -X POST http://localhost:3001/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test rapport",
    "description": "Description du rapport",
    "priority": "high",
    "latitude": -18.8792,
    "longitude": 47.5079,
    "location_name": "Test location"
  }'
```
