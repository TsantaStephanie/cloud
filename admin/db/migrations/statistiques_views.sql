-- Vues pour les statistiques de traitement

-- Vue pour calculer le délai moyen de traitement par gravité
CREATE VIEW vue_delai_moyen_gravite AS
SELECT 
    gravite,
    COUNT(*) as nombre_travaux,
    AVG(delai_jours) as delai_moyen_jours,
    MIN(delai_jours) as delai_min_jours,
    MAX(delai_jours) as delai_max_jours,
    ROUND(AVG(delai_jours), 2) as delai_moyen_arrondi
FROM statistiques_traitement 
WHERE delai_jours IS NOT NULL
GROUP BY gravite
ORDER BY delai_moyen_jours DESC;

-- Vue pour calculer le délai moyen de traitement par entreprise
CREATE VIEW vue_delai_moyen_entreprise AS
SELECT 
    COALESCE(entreprise, 'Non spécifiée') as entreprise,
    COUNT(*) as nombre_travaux,
    AVG(delai_jours) as delai_moyen_jours,
    MIN(delai_jours) as delai_min_jours,
    MAX(delai_jours) as delai_max_jours,
    ROUND(AVG(delai_jours), 2) as delai_moyen_arrondi,
    SUM(budget) as budget_total
FROM statistiques_traitement 
WHERE delai_jours IS NOT NULL
GROUP BY entreprise
ORDER BY delai_moyen_jours DESC;

-- Vue pour les statistiques mensuelles
CREATE VIEW vue_statistiques_mensuelles AS
SELECT 
    annee,
    mois,
    COUNT(*) as nombre_travaux_termine,
    AVG(delai_jours) as delai_moyen_jours,
    MIN(delai_jours) as delai_min_jours,
    MAX(delai_jours) as delai_max_jours,
    ROUND(AVG(delai_jours), 2) as delai_moyen_arrondi,
    SUM(budget) as budget_mensuel
FROM statistiques_traitement 
WHERE delai_jours IS NOT NULL
GROUP BY annee, mois
ORDER BY annee DESC, mois DESC;

-- Vue pour les tendances annuelles
CREATE VIEW vue_tendances_annuelles AS
SELECT 
    annee,
    COUNT(*) as nombre_travaux_termine,
    AVG(delai_jours) as delai_moyen_annuel,
    MIN(delai_jours) as delai_min_annuel,
    MAX(delai_jours) as delai_max_annuel,
    ROUND(AVG(delai_jours), 2) as delai_moyen_arrondi,
    SUM(budget) as budget_annuel
FROM statistiques_traitement 
WHERE delai_jours IS NOT NULL
GROUP BY annee
ORDER BY annee DESC;

-- Fonction pour mettre à jour les statistiques quand un travail est terminé
CREATE OR REPLACE FUNCTION mettre_a_jour_statistiques()
RETURNS TRIGGER AS $$
BEGIN
    -- Insérer ou mettre à jour les statistiques quand le statut passe à 'termine'
    IF NEW.statut = 'termine' AND OLD.statut != 'termine' THEN
        INSERT INTO statistiques_traitement (
            route_id, 
            date_debut, 
            date_fin, 
            delai_jours, 
            gravite, 
            entreprise, 
            budget, 
            annee, 
            mois
        ) VALUES (
            NEW.id,
            NEW.date_creation,
            CURRENT_TIMESTAMP,
            EXTRACT(DAY FROM (CURRENT_TIMESTAMP - NEW.date_creation)),
            NEW.gravite,
            NEW.entreprise,
            NEW.budget,
            EXTRACT(YEAR FROM CURRENT_TIMESTAMP),
            EXTRACT(MONTH FROM CURRENT_TIMESTAMP)
        )
        ON CONFLICT (route_id) DO UPDATE SET
            date_fin = CURRENT_TIMESTAMP,
            delai_jours = EXTRACT(DAY FROM (CURRENT_TIMESTAMP - NEW.date_creation)),
            date_calcul = CURRENT_TIMESTAMP;
    END IF;
    
    -- Enregistrer l'historique des changements de statut
    IF NEW.statut != OLD.statut THEN
        INSERT INTO historique_statuts (
            route_id, 
            ancien_statut, 
            nouveau_statut, 
            utilisateur_id
        ) VALUES (
            NEW.id,
            OLD.statut,
            NEW.statut,
            NEW.utilisateur_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour déclencher la mise à jour des statistiques
CREATE TRIGGER trigger_mise_a_jour_statistiques
    AFTER UPDATE ON routes_endommagees
    FOR EACH ROW
    EXECUTE FUNCTION mettre_a_jour_statistiques();

-- Procédure pour calculer les statistiques pour les travaux existants
CREATE OR REPLACE PROCEDURE calculer_statistiques_existantes()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insérer les statistiques pour les travaux déjà terminés
    INSERT INTO statistiques_traitement (
        route_id, 
        date_debut, 
        date_fin, 
        delai_jours, 
        gravite, 
        entreprise, 
        budget, 
        annee, 
        mois
    )
    SELECT 
        id,
        date_creation,
        date_mise_a_jour,
        EXTRACT(DAY FROM (date_mise_a_jour - date_creation)),
        gravite,
        entreprise,
        budget,
        EXTRACT(YEAR FROM date_mise_a_jour),
        EXTRACT(MONTH FROM date_mise_a_jour)
    FROM routes_endommagees 
    WHERE statut = 'termine' 
    AND id NOT IN (SELECT route_id FROM statistiques_traitement)
    ON CONFLICT (route_id) DO NOTHING;
    
    COMMIT;
END;
$$;
