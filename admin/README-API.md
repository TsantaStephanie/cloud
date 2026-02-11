# Architecture API - Admin Dashboard

## 🏗️ Architecture complète

L'application utilise maintenant une architecture 3-tiers:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Database      │
│   Port: 5173    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
   Navigateur              Express.js              PostgreSQL
   - Interface             - API REST              - Données
   - Appels fetch           - Authentification      - Persistance
   - Affichage              - Validation            - Requêtes SQL
```

## 🚀 Démarrage rapide

### 1. Démarrer l'infrastructure
```bash
# Démarrer PostgreSQL + Backend Admin + TileServer
docker-compose up -d
```

### 2. Démarrer le frontend
```bash
# Installer les dépendances
npm install

# Démarrer le développement
npm run dev
```

### 3. Démarrer le backend visiteur (optionnel)
```bash
cd ../backend-visiteur
./mvnw spring-boot:run
```

## 📡 Endpoints API

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur

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

#### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_BACKEND_VISITEUR_URL=http://localhost:8080
```

#### Backend Admin (.env)
```env
PORT=3001
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=cloud_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
```

## 🔄 Flux de données

### Connexion utilisateur
1. Frontend envoie `POST /api/auth/login`
2. Backend vérifie les identifiants dans PostgreSQL
3. Backend retourne les informations utilisateur (sans mot de passe)
4. Frontend stocke le token/session

### Gestion des rapports
1. Frontend appelle `GET /api/reports`
2. Backend exécute `SELECT * FROM reports ORDER BY created_at DESC`
3. Backend retourne la liste des rapports
4. Frontend affiche les données

### Synchronisation avec visiteur
1. Frontend appelle le backend visiteur
2. Backend visiteur retourne les données Firebase
3. Frontend envoie les données au backend admin
4. Backend admin insère dans PostgreSQL

## 🛡️ Sécurité

### Backend Admin
- **CORS**: Limité à localhost:5173 et localhost:3000
- **Rate Limiting**: 100 requêtes/15 minutes
- **Helmet**: Protection des headers HTTP
- **Bcrypt**: Hashage des mots de passe (12 rounds)
- **Validation**: Validation des entrées utilisateur

### Frontend
- **API Calls**: Utilisation de fetch avec gestion d'erreurs
- **Type Safety**: Types TypeScript pour toutes les réponses API
- **Error Handling**: Messages d'erreur utilisateur-friendly

## 🧪 Tests

### Test de connexion
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cloud.com", "password": "admin123"}'
```

### Test de récupération des rapports
```bash
curl http://localhost:3001/api/reports
```

### Test de création de rapport
```bash
curl -X POST http://localhost:3001/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test rapport",
    "description": "Description du test",
    "priority": "high",
    "latitude": -18.8792,
    "longitude": 47.5079,
    "location_name": "Test location"
  }'
```

## 🐛 Dépannage

### Erreurs communes

#### "Buffer is not defined"
**Cause**: Tentative d'utiliser pg dans le navigateur
**Solution**: Utiliser l'API backend au lieu du driver direct

#### "CORS error"
**Cause**: Frontend et backend sur des ports différents
**Solution**: CORS configuré dans le backend

#### "Connection refused"
**Cause**: Backend non démarré
**Solution**: Démarrer le backend avec `npm start` ou `docker-compose`

#### "Database connection failed"
**Cause**: PostgreSQL non accessible
**Solution**: Vérifier que PostgreSQL est démarré et accessible

### Logs

#### Backend Admin
```bash
# Voir les logs du conteneur
docker-compose logs backend-admin

# Logs en temps réel
docker-compose logs -f backend-admin
```

#### PostgreSQL
```bash
# Logs PostgreSQL
docker-compose logs postgres
```

## 📈 Performance

### Optimisations
- **Connection Pooling**: Pool de connexions PostgreSQL
- **Rate Limiting**: Protection contre les abus
- **Async/Await**: Opérations non-bloquantes
- **Error Boundaries**: Gestion des erreurs frontend

### Monitoring
- **Health Check**: `/api/health` pour vérifier le statut
- **Database Logs**: Logs des requêtes SQL
- **API Logs**: Logs des requêtes HTTP

## 🔄 Migrations

### Depuis Supabase
- Les fichiers `src/lib/supabase.ts` et `src/lib/postgres.ts` sont remplacés par `src/lib/api.ts`
- L'authentification est gérée par le backend admin
- Les appels directs à la base sont remplacés par des appels API

### Avantages
- ✅ Plus sécurisé (pas de connexion directe à la BDD)
- ✅ Compatible avec le navigateur
- ✅ Meilleure séparation des responsabilités
- ✅ Facile à déployer et scaler
