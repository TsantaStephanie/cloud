# Données de Test - Projet Cloud Admin

Ce document contient les informations sur les données de test disponibles dans la base de données PostgreSQL.

## 📋 Comptes Utilisateurs

### Identifiants de connexion
**Mot de passe pour tous les comptes**: `password123`

| Email | Rôle | Nom | Téléphone | Description |
|-------|------|-----|-----------|-------------|
| `admin@cloud.com` | Manager | Administrator | - | Compte administrateur principal |
| `manager@test.com` | Manager | Manager Test | +261340123456 | Gestionnaire de test |
| `user1@test.com` | User | User One | +261340123457 | Utilisateur standard 1 |
| `user2@test.com` | User | User Two | +261340123458 | Utilisateur standard 2 |
| `visitor@test.com` | Visitor | Visitor Test | +261340123459 | Visiteur (lecture seule) |

### Comptes spéciaux pour tests
| Email | État | Description |
|-------|------|-------------|
| `blocked@test.com` | Bloqué | Compte bloqué pour 1h (5 tentatives échouées) |
| `failed@test.com` | Actif | 3 tentatives de connexion échouées |
| `normal@test.com` | Actif | Compte normal sans tentatives échouées |

## 📊 Rapports de Test

10 rapports ont été créés avec différents statuts et priorités:

### Répartition par statut
- **Reported**: 4 rapports
- **In Progress**: 3 rapports  
- **Completed**: 2 rapports
- **Rejected**: 1 rapport

### Répartition par priorité
- **Urgent**: 2 rapports
- **High**: 3 rapports
- **Medium**: 4 rapports
- **Low**: 1 rapport

### Exemples de rapports

1. **Nid de poule sur Route Nationale 1** (Urgent)
   - Localisation: RN1 - Antananarivo
   - Statut: Reported
   - Auteur: User One

2. **Panneau de signalisation cassé** (Medium)
   - Localisation: Avenue de la Démocratie
   - Statut: In Progress
   - Auteur: User Two

3. **Bouchon permanent au rond-point** (Urgent)
   - Localisation: Rond-point Behoririka
   - Statut: Reported
   - Auteur: Visitor Test

4. **Route inondée après pluie** (High)
   - Localisation: Marché Analakely
   - Statut: Completed
   - Auteur: User One

## 🗺️ Localisations

Les rapports couvrent différentes zones d'Antananarivo:
- Centre-ville (Analakely, Behoririka)
- Routes principales (RN1, Avenue de l'Indépendance)
- Quartiers résidentiels (Andohatapenaka, Ambohidratrimo)

## 🚀 Comment utiliser les données

### 1. Recharger les données de test
```bash
# Arrêter PostgreSQL
docker-compose down postgres

# Supprimer le volume (attention: efface toutes les données)
docker volume rm cloud_postgres_data

# Redémarrer avec les données de test
docker-compose up -d postgres
```

### 2. Se connecter avec différents rôles

**Manager** (accès complet):
```javascript
// Peut voir, modifier, supprimer tous les rapports
// Peut gérer les utilisateurs
// Peut voir les statistiques
```

**User** (accès limité):
```javascript
// Peut voir tous les rapports
// Peut créer/modifier ses propres rapports
// Peut mettre à jour son profil
```

**Visitor** (lecture seule):
```javascript
// Peut seulement voir les rapports
// Ne peut pas créer/modifier de rapports
```

### 3. Tests de fonctionnalités

**Authentification**:
- Connexion réussie avec `password123`
- Test de comptes bloqués (`blocked@test.com`)
- Test de limite de tentatives

**Gestion des rapports**:
- Création de nouveaux rapports
- Modification du statut (reported → in_progress → completed)
- Filtrage par statut/priorité
- Suppression (managers uniquement)

**Recherche et filtrage**:
- Par localisation géographique
- Par statut
- Par priorité
- Par utilisateur

## 📈 Statistiques attendues

Après insertion des données de test:
- **Utilisateurs**: 7 comptes
- **Rapports**: 10 rapports
- **Tentatives de connexion**: 3 enregistrements

## 🔧 Personnalisation

Pour modifier les données de test:
1. Éditer `db/init/02-test-data.sql`
2. Reconstruire le conteneur PostgreSQL
3. Les changements seront appliqués automatiquement

## ⚠️ Important

- Ces données sont **uniquement pour le développement**
- Ne **jamais** utiliser en production
- Les mots de passe sont simples pour faciliter les tests
- Les localisations sont réelles mais les rapports sont fictifs
