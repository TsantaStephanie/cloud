CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'utilisateur', 'visiteur'))
);

CREATE TABLE routes_endommagees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    gravite VARCHAR(50) CHECK (gravite IN ('faible', 'moyenne', 'elevee', 'critique')),
    description TEXT,
    statut VARCHAR(50) CHECK (statut IN ('signale', 'verifie', 'en_cours', 'repare')) DEFAULT 'signale',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE signalements_hors_ligne (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_appareil VARCHAR(255),
    donnees_signalement JSONB NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);