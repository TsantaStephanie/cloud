-- Requêtes d'exemple pour le tableau de bord des statistiques

-- 1. Délai moyen de traitement global
SELECT 
    COUNT(*) as total_travaux,
    ROUND(AVG(delai_jours), 2) as delai_moyen_global,
    MIN(delai_jours) as delai_min,
    MAX(delai_jours) as delai_max
FROM statistiques_traitement 
WHERE delai_jours IS NOT NULL;

-- 2. Délai moyen par niveau de gravité
SELECT * FROM vue_delai_moyen_gravite;

-- 3. Top 10 des entreprises avec les délais les plus longs
SELECT 
    entreprise,
    nombre_travaux,
    delai_moyen_arrondi,
    delai_max_jours
FROM vue_delai_moyen_entreprise 
WHERE nombre_travaux >= 3
ORDER BY delai_moyen_arrondi DESC 
LIMIT 10;

-- 4. Évolution mensuelle des délais (6 derniers mois)
SELECT 
    TO_CHAR(annee::text || '-' || LPAD(mois::text, 2, '0')::text, 'YYYY-MM') as periode,
    nombre_travaux_termine,
    delai_moyen_arrondi,
    budget_mensuel
FROM vue_statistiques_mensuelles 
ORDER BY annee DESC, mois DESC 
LIMIT 6;

-- 5. Comparaison annuelle des performances
SELECT 
    annee,
    nombre_travaux_termine,
    delai_moyen_arrondi,
    budget_annuel,
    LAG(delai_moyen_arrondi) OVER (ORDER BY annee) as delai_annee_precedente,
    ROUND(
        ((delai_moyen_arrondi - LAG(delai_moyen_arrondi) OVER (ORDER BY annee)) / 
         LAG(delai_moyen_arrondi) OVER (ORDER BY annee)) * 100, 2
    ) as variation_pourcentage
FROM vue_tendances_annuelles 
ORDER BY annee DESC;

-- 6. Distribution des délais par catégories
SELECT 
    CASE 
        WHEN delai_jours <= 7 THEN '0-7 jours (Rapide)'
        WHEN delai_jours <= 14 THEN '8-14 jours (Normal)'
        WHEN delai_jours <= 30 THEN '15-30 jours (Lent)'
        ELSE '>30 jours (Très lent)'
    END as categorie_delai,
    COUNT(*) as nombre_travaux,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM statistiques_traitement WHERE delai_jours IS NOT NULL), 2) as pourcentage
FROM statistiques_traitement 
WHERE delai_jours IS NOT NULL
GROUP BY categorie_delai
ORDER BY MIN(delai_jours);

-- 7. Statistiques détaillées par gravité et entreprise
SELECT 
    gravite,
    entreprise,
    COUNT(*) as nombre_travaux,
    ROUND(AVG(delai_jours), 2) as delai_moyen,
    ROUND(AVG(budget), 2) as budget_moyen
FROM statistiques_traitement 
WHERE delai_jours IS NOT NULL AND entreprise IS NOT NULL
GROUP BY gravite, entreprise
ORDER BY gravite, delai_moyen DESC;

-- 8. KPIs principaux pour le dashboard
WITH stats_globales AS (
    SELECT 
        COUNT(*) as total_travaux,
        ROUND(AVG(delai_jours), 2) as delai_moyen,
        ROUND(AVG(budget), 2) as budget_moyen
    FROM statistiques_traitement 
    WHERE delai_jours IS NOT NULL
),
mois_courant AS (
    SELECT 
        COUNT(*) as travaux_mois,
        ROUND(AVG(delai_jours), 2) as delai_mois
    FROM statistiques_traitement 
    WHERE delai_jours IS NOT NULL 
    AND annee = EXTRACT(YEAR FROM CURRENT_DATE)
    AND mois = EXTRACT(MONTH FROM CURRENT_DATE)
)
SELECT 
    'Total travaux' as indicateur,
    total_travaux as valeur,
    NULL as variation
FROM stats_globales

UNION ALL

SELECT 
    'Délai moyen (jours)',
    delai_moyen,
    NULL
FROM stats_globales

UNION ALL

SELECT 
    'Budget moyen',
    budget_moyen,
    NULL
FROM stats_globales

UNION ALL

SELECT 
    'Travaux ce mois',
    travaux_mois,
    NULL
FROM mois_courant

UNION ALL

SELECT 
    'Délai moyen mois',
    delai_mois,
    NULL
FROM mois_courant;
