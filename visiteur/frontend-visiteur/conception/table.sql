drop database if exists road_db;
CREATE DATABASE road_db;
\c road_db;

CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'utilisateur', 'visiteur')) DEFAULT 'visiteur'
);

CREATE TABLE routes_endommagees (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    gravite VARCHAR(50) CHECK (gravite IN ('faible', 'moyenne', 'elevee', 'critique')),
    description TEXT,
    statut VARCHAR(50) CHECK (statut IN ('signale', 'verifie', 'en_cours', 'repare')) DEFAULT 'signale',
    longueur_km DECIMAL(8, 2) DEFAULT 0.00,
    budget DECIMAL(12, 2),  -- Budget estimé en Ariary
    entreprise VARCHAR(255),  -- Nom de l'entreprise responsable
    date_signalement DATE,  -- Date à laquelle le problème a été observé
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signalements(
    id SERIAL PRIMARY KEY,
    id_appareil VARCHAR(255),
    donnees_signalement JSONB NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);