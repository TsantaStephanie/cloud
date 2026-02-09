# PostgreSQL Setup for Cloud Admin Project

Ce document explique comment utiliser PostgreSQL avec Docker pour le projet admin.

## Prérequis

- Docker et Docker Compose installés
- Node.js (pour l'application frontend)

## Configuration

### 1. Variables d'environnement

Copiez le fichier `.env.example` vers `.env.local`:

```bash
cp .env.example .env.local
```

Modifiez les variables si nécessaire:

```env
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=cloud_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
```

### 2. Démarrage de la base de données

Lancez PostgreSQL avec Docker Compose:

```bash
docker-compose up -d postgres
```

Cela va:
- Créer un conteneur PostgreSQL 15
- Initialiser la base de données avec le schéma dans `db/init/01-init-schema.sql`
- Créer un utilisateur admin par défaut (email: `admin@cloud.com`, mot de passe: `admin123`)

### 3. Installation des dépendances

Installez les dépendances npm:

```bash
npm install
```

## Utilisation

### Connexion à la base de données

Le projet utilise les fichiers suivants pour interagir avec PostgreSQL:

- `src/lib/postgres.ts` - Configuration et connexion à la base de données
- `src/lib/auth.ts` - Fonctions d'authentification (inscription, connexion)
- `src/lib/reports.ts` - Fonctions de gestion des rapports

### Fonctions disponibles

#### Authentification
- `registerUser()` - Inscrire un nouvel utilisateur
- `loginUser()` - Connecter un utilisateur
- `getUserById()` - Récupérer un utilisateur par ID
- `updateUserProfile()` - Mettre à jour le profil utilisateur
- `changePassword()` - Changer le mot de passe

#### Rapports
- `getAllReports()` - Récupérer tous les rapports
- `getReportById()` - Récupérer un rapport par ID
- `createReport()` - Créer un nouveau rapport
- `updateReport()` - Mettre à jour un rapport
- `deleteReport()` - Supprimer un rapport
- `getReportsStatistics()` - Obtenir des statistiques sur les rapports

## Migration depuis Supabase

Le projet utilisait précédemment Supabase. Les changements principaux:

1. **Base de données**: PostgreSQL local au lieu de Supabase
2. **Authentification**: Gestion locale avec bcryptjs au lieu de l'auth Supabase
3. **Configuration**: Variables d'environnement locales au lieu des clés Supabase

### Schéma de la base de données

Le schéma PostgreSQL est compatible avec le schéma Supabase précédent:

- `profiles` - Utilisateurs avec authentification locale
- `reports` - Rapports de dommages routiers
- `login_attempts` - Tentatives de connexion (pour sécurité)

## Développement

### Lancer l'application

1. Démarrez PostgreSQL:
```bash
docker-compose up -d postgres
```

2. Démarrez l'application frontend:
```bash
npm run dev
```

### Se connecter à la base de données

Vous pouvez vous connecter directement à PostgreSQL avec:

```bash
docker exec -it cloud_postgres psql -U postgres -d cloud_db
```

Ou avec un client GUI (DBeaver, pgAdmin, etc.) avec:
- Hôte: localhost
- Port: 5432
- Base: cloud_db
- Utilisateur: postgres
- Mot de passe: postgres123

## Dépannage

### Problèmes courants

1. **Le conteneur PostgreSQL ne démarre pas**
   - Vérifiez que le port 5432 n'est pas utilisé
   - Arrêtez les autres conteneurs PostgreSQL: `docker stop $(docker ps -q --filter ancestor=postgres)`

2. **Erreur de connexion**
   - Vérifiez que le conteneur est en cours d'exécution: `docker ps`
   - Vérifiez les variables d'environnement dans `.env.local`

3. **Problèmes de permissions**
   - Assurez-vous que le dossier `db/init` est accessible
   - Vérifiez les permissions Docker

### Logs

Pour voir les logs de PostgreSQL:
```bash
docker-compose logs postgres
```

### Réinitialisation

Pour réinitialiser complètement la base de données:
```bash
docker-compose down -v
docker-compose up -d postgres
```

## Sécurité

- Le mot de passe par défaut est `postgres123` - changez-le en production
- Utilisez des variables d'environnement sécurisées en production
- Le conteneur PostgreSQL n'est exposé qu'en local (port 5432)
- Les mots de passe sont hashés avec bcryptjs (12 rounds)
