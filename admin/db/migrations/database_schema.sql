
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
    gravite VARCHAR(50) CHECK (gravite IN ('faible', 'moyenne', 'elevee', 'critique')),
    imageUrl TEXT,
    description TEXT,
    statut VARCHAR(50) CHECK (statut IN ('nouveau', 'verifie', 'en_cours', 'termine')) DEFAULT 'nouveau',
    longueur_km DECIMAL(8, 2) DEFAULT 0.00,
    surface_m2 DECIMAL(10, 2),
    budget DECIMAL(12, 2),
    entreprise VARCHAR(255),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Index pour optimiser les performances
CREATE INDEX idx_routes_statut ON routes_endommagees(statut);
CREATE INDEX idx_routes_gravite ON routes_endommagees(gravite);
CREATE INDEX idx_routes_utilisateur ON routes_endommagees(utilisateur_id);


-- créer l'utilisateur admin
INSERT INTO utilisateurs (email, mot_de_passe_hash, role) VALUES ('admin@example.com', 'admin', 'admin');
