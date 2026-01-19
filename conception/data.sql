INSERT INTO utilisateurs (email, mot_de_passe_hash, role) VALUES
('admin@routes.fr', 'admin123', 'admin');

INSERT INTO utilisateurs (email, mot_de_passe_hash, role) VALUES
('jean@mail.com', 'user123', 'utilisateur');

INSERT INTO utilisateurs (email, mot_de_passe_hash, role) VALUES
('visiteur@mail.com', 'visitor123', 'visiteur');

INSERT INTO routes_endommagees (utilisateur_id, latitude, longitude, gravite, description, statut) VALUES
(2, -18.8792, 47.5079, 'critique', 'Grand nid-de-poule avenue de l''Indépendance', 'signale'),
(2, -18.9136, 47.5361, 'elevee', 'Chaussée effondrée à Ambohijanahary', 'verifie'),
(1, -18.8667, 47.5167, 'moyenne', 'Route défoncée à Analakely', 'en_cours'),
(2, -18.9036, 47.5272, 'faible', 'Petite fissure route d''Andrainarivo', 'repare'),
(1, -18.8900, 47.5500, 'elevee', 'Inondation à Andravoahangy', 'signale');


INSERT INTO routes_endommagees (utilisateur_id, latitude, longitude, gravite, description, statut) VALUES
(2, -18.9500, 47.6000, 'elevee', 'Glissement de terrain à Mandroseza', 'en_cours'),
(1, -19.0167, 47.7167, 'critique', 'Pont endommagé à Brickaville', 'signale'),
(2, -18.1667, 49.3833, 'elevee', 'Route inondée à Toamasina', 'signale');


INSERT INTO routes_endommagees (utilisateur_id, latitude, longitude, gravite, description, statut) VALUES
(1, -19.0833, 47.0500, 'critique', 'Éboulement à Ambatolampy', 'signale'),
(2, -19.8667, 47.0333, 'elevee', 'Route très défoncée avant Antsirabe', 'en_cours'),
(1, -21.4536, 47.0858, 'moyenne', 'Route difficile à Fianarantsoa', 'verifie');


INSERT INTO signalements_hors_ligne (id_appareil, donnees_signalement) VALUES
('samsung_tana_001', '{"latitude": -18.8792, "longitude": 47.5079, "gravite": "critique", "description": "Grand nid-de-poule avenue de l''Indépendance - signalé hors ligne", "ville": "Antananarivo", "type": "nid_de_poule"}'),
('iphone_tana_002', '{"latitude": -18.9136, "longitude": 47.5361, "gravite": "elevee", "description": "Chaussée effondrée à Ambohijanahary - en attente sync", "ville": "Antananarivo", "type": "effondrement"}');


INSERT INTO signalements_hors_ligne (id_appareil, donnees_signalement) VALUES
('oppo_rn2_005', '{"latitude": -18.9500, "longitude": 47.6000, "gravite": "elevee", "description": "Glissement terrain Mandroseza - hors ligne", "route": "RN2", "type": "glissement"}'),
('nokia_rn2_006', '{"latitude": -19.0167, "longitude": 47.7167, "gravite": "critique", "description": "Pont endommagé Brickaville - à synchroniser", "route": "RN2", "type": "pont_endommage"}');
