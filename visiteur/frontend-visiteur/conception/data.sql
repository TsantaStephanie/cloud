-- D'abord, insérer quelques utilisateurs de test
INSERT INTO utilisateurs (email, mot_de_passe_hash, role) VALUES
('admin@route.mg', 'admin', 'admin'),
('user1@route.mg', 'user1', 'utilisateur'),
('user2@route.mg', 'user2', 'utilisateur');

-- Version alternative ultra-simple
INSERT INTO routes_endommagees (utilisateur_id, latitude, longitude, gravite, description, statut, longueur_km) VALUES
(2, -18.8792, 47.5079, 'critique', 'Grand nid-de-poule avenue Independence', 'signale', 0.05),
(2, -18.9136, 47.5361, 'elevee', 'Chaussee effondree Ambohijanahary', 'verifie', 0.15),
(1, -18.8667, 47.5167, 'moyenne', 'Route defoncee Analakely', 'en_cours', 0.30),
(2, -18.9036, 47.5272, 'faible', 'Petite fissure route Andrainarivo', 'repare', 0.02),
(3, -18.8900, 47.5500, 'elevee', 'Inondation Andravoahangy', 'signale', 0.80),
(1, -18.9200, 47.5250, 'moyenne', 'Trottoir endommage Anosy', 'verifie', 0.10),
(3, -18.8783, 47.5125, 'critique', 'Trou profond route Mahamasina', 'en_cours', 0.08),
(2, -18.8994, 47.5339, 'faible', 'Fissures legeres Isotry', 'signale', 0.03),
(1, -18.9108, 47.5192, 'elevee', 'Chaussee cassee Antanimena', 'repare', 0.25),
(3, -18.8878, 47.5411, 'moyenne', 'Route bosselee Ampasanimalo', 'signale', 0.12),
(2, -18.8961, 47.5283, 'critique', 'Eboulement route Ambohimanarina', 'verifie', 0.40),
(1, -18.8744, 47.5056, 'elevee', 'Pont fissure Ankadimbahoaka', 'en_cours', 0.20),
(3, -18.8850, 47.5178, 'moyenne', 'Deformation chaussee Tsaralalana', 'repare', 0.18),
(2, -18.9083, 47.5111, 'faible', 'Nid-de-poule mineur Faravohitra', 'signale', 0.04),
(1, -18.8933, 47.5233, 'elevee', 'Inondation Antaninarenina', 'verifie', 0.60);