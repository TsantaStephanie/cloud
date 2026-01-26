# Configuration du serveur backend

## Étape 1: Installer PostgreSQL
1. Téléchargez et installez PostgreSQL depuis https://www.postgresql.org/download/
2. Pendant l'installation, définissez un mot de passe pour l'utilisateur `postgres`

## Étape 2: Créer la base de données
1. Ouvrez pgAdmin ou utilisez la ligne de commande
2. Créez une nouvelle base de données nommée `road_db`

## Étape 3: Exécuter les scripts SQL
1. Connectez-vous à votre base de données `road_db`
2. Exécutez le fichier `../conception/table.sql` pour créer les tables
3. Exécutez le fichier `../conception/data.sql` pour insérer les données

## Étape 4: Configurer le serveur
1. Créez un fichier `.env` dans ce dossier avec:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=road_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgresql
PORT=3001
```

## Étape 5: Installer les dépendances et démarrer
```bash
cd server
npm install
npm run dev
```

## Étape 6: Mettre à jour le frontend
Dans le fichier `../src/lib/database.ts`, remplacez les données mock par des appels API vers `http://localhost:3001/api/routes`
