
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'utilisateur')) DEFAULT 'utilisateur',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routes_endommagees (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    gravite INTEGER CHECK (gravite >= 1 AND gravite <= 10),
    imageUrl TEXT,
    description TEXT,
    statut VARCHAR(50) CHECK (statut IN ('nouveau', 'en_cours', 'termine')) DEFAULT 'nouveau',
    longueur_km DECIMAL(8, 2) DEFAULT 0.00,
    surface_m2 DECIMAL(10, 2),
    budget DECIMAL(12, 2) GENERATED ALWAYS AS (COALESCE(surface_m2, 0) * COALESCE(niveau_gravite, 1) * (SELECT COALESCE(prix_par_m2, 1000) FROM configuration_prix WHERE id = 1)) STORED,
    entreprise VARCHAR(255),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour la configuration des prix
CREATE TABLE configuration_prix (
    id SERIAL PRIMARY KEY,
    prix_par_m2 DECIMAL(10, 2) DEFAULT 1000.00,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- Insérer la configuration par défaut
INSERT INTO configuration_prix (id, prix_par_m2) VALUES (1, 1000.00);

-- Table pour suivre l'historique des changements de statut
CREATE TABLE historique_statuts (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes_endommagees(id) ON DELETE CASCADE,
    ancien_statut VARCHAR(50),
    nouveau_statut VARCHAR(50) NOT NULL,
    date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- Table pour les statistiques de traitement
CREATE TABLE statistiques_traitement (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes_endommagees(id) ON DELETE CASCADE,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP,
    delai_jours DECIMAL(5, 2),
    gravite VARCHAR(50),
    entreprise VARCHAR(255),
    budget DECIMAL(12, 2),
    annee INTEGER,
    mois INTEGER,
    date_calcul TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour la gestion des sessions utilisateur
CREATE TABLE sessions_utilisateur (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    token_session VARCHAR(255) UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    est_active BOOLEAN DEFAULT true
);

-- Table pour les tentatives de connexion
CREATE TABLE tentatives_connexion (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    succes BOOLEAN NOT NULL,
    raison_echec VARCHAR(255),
    date_tentative TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Table pour le blocage des comptes
CREATE TABLE comptes_bloques (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    date_blocage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_deblocage TIMESTAMP,
    raison_blocage VARCHAR(255) DEFAULT 'Trop de tentatives de connexion',
    nombre_tentatives INTEGER DEFAULT 0,
    est_actif BOOLEAN DEFAULT true
);


-- Index pour optimiser les performances
CREATE INDEX idx_routes_statut ON routes_endommagees(statut);
CREATE INDEX idx_routes_gravite ON routes_endommagees(gravite);
CREATE INDEX idx_routes_utilisateur ON routes_endommagees(utilisateur_id);

-- Index pour les tables de statistiques
CREATE INDEX idx_historique_route_id ON historique_statuts(route_id);
CREATE INDEX idx_historique_date_changement ON historique_statuts(date_changement);
CREATE INDEX idx_statistiques_route_id ON statistiques_traitement(route_id);
CREATE INDEX idx_statistiques_annee_mois ON statistiques_traitement(annee, mois);
CREATE INDEX idx_statistiques_gravite ON statistiques_traitement(gravite);
CREATE INDEX idx_statistiques_entreprise ON statistiques_traitement(entreprise);

-- Index pour les tables de sécurité
CREATE INDEX idx_sessions_utilisateur_id ON sessions_utilisateur(utilisateur_id);
CREATE INDEX idx_sessions_token ON sessions_utilisateur(token_session);
CREATE INDEX idx_sessions_expiration ON sessions_utilisateur(date_expiration);
CREATE INDEX idx_tentatives_email ON tentatives_connexion(email);
CREATE INDEX idx_tentatives_date ON tentatives_connexion(date_tentative);
CREATE INDEX idx_comptes_bloques_email ON comptes_bloques(email);
CREATE INDEX idx_comptes_bloques_actif ON comptes_bloques(est_actif);


-- créer l'utilisateur admin
INSERT INTO utilisateurs (email, mot_de_passe_hash, role) VALUES ('admin@example.com', 'admin', 'admin');
