import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { randomBytes } from 'crypto';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'cloud_db',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres123',
});

// Configuration sécurité
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 3;
const SESSION_DURATION_HOURS = parseInt(process.env.SESSION_DURATION_HOURS) || 24;
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jetons-securise';

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Admin Cloud',
      version: '1.0.0',
      description: 'API pour la gestion des routes endommagées et statistiques',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/index.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (augmenté pour la synchronisation)
});
app.use('/api/', limiter);

// Test de connexion à la base de données
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

// Middleware de gestion d'erreurs
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Fonctions utilitaires pour la sécurité
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: `${SESSION_DURATION_HOURS}h` });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const generateSessionToken = () => {
  return randomBytes(32).toString('hex');
};

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requis' });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token invalide' });
  }
};

// Vérifier si un compte est bloqué
const isAccountBlocked = async (email) => {
  const result = await pool.query(
    'SELECT * FROM comptes_bloques WHERE email = $1 AND est_actif = true',
    [email]
  );
  return result.rows.length > 0;
};

// Enregistrer une tentative de connexion
const logLoginAttempt = async (email, success, ipAddress, userAgent, failureReason = null) => {
  await pool.query(
    'INSERT INTO tentatives_connexion (email, ip_address, user_agent, succes, raison_echec) VALUES ($1, $2, $3, $4, $5)',
    [email, ipAddress, userAgent, success, failureReason]
  );
};

// Bloquer un compte
const blockAccount = async (email, reason = 'Trop de tentatives de connexion') => {
  await pool.query(`
    INSERT INTO comptes_bloques (email, raison_blocage, nombre_tentatives) 
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO UPDATE SET
      date_blocage = CURRENT_TIMESTAMP,
      est_actif = true,
      raison_blocage = $2,
      nombre_tentatives = $3
  `, [email, reason, MAX_LOGIN_ATTEMPTS]);
};

// Vérifier les tentatives récentes
const getRecentAttempts = async (email, minutes = 15) => {
  const result = await pool.query(`
    SELECT COUNT(*) as count 
    FROM tentatives_connexion 
    WHERE email = $1 
    AND date_tentative > CURRENT_TIMESTAMP - INTERVAL '${minutes} minutes'
    AND succes = false
  `, [email]);
  return parseInt(result.rows[0].count);
};

// Nettoyer les sessions expirées
const cleanupExpiredSessions = async () => {
  await pool.query(
    'DELETE FROM sessions_utilisateur WHERE date_expiration < CURRENT_TIMESTAMP'
  );
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides ou compte bloqué
 *       423:
 *         description: Compte bloqué
 */
app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  // Vérifier si le compte est bloqué
  const isBlocked = await isAccountBlocked(email);
  if (isBlocked) {
    await logLoginAttempt(email, false, ipAddress, userAgent, 'Compte bloqué');
    return res.status(423).json({
      success: false,
      message: 'Compte bloqué. Veuillez contacter l\'administrateur.'
    });
  }

  // Vérifier les tentatives récentes
  const recentAttempts = await getRecentAttempts(email);
  if (recentAttempts >= MAX_LOGIN_ATTEMPTS) {
    await blockAccount(email);
    await logLoginAttempt(email, false, ipAddress, userAgent, 'Trop de tentatives');
    return res.status(423).json({
      success: false,
      message: `Compte bloqué après ${MAX_LOGIN_ATTEMPTS} tentatives échouées.`
    });
  }

  const result = await pool.query(
    'SELECT id, email, mot_de_passe_hash, role FROM utilisateurs WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    await logLoginAttempt(email, false, ipAddress, userAgent, 'Email non trouvé');
    return res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }

  const user = result.rows[0];
  const isValidPassword = password === user.mot_de_passe_hash; // Comparaison simple (pas de bcrypt)

  if (!isValidPassword) {
    await logLoginAttempt(email, false, ipAddress, userAgent, 'Mot de passe incorrect');
    return res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }

  // Connexion réussie
  await logLoginAttempt(email, true, ipAddress, userAgent);

  // Générer les tokens
  const jwtToken = generateToken(user.id);
  const sessionToken = generateSessionToken();
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + SESSION_DURATION_HOURS);

  // Créer la session
  await pool.query(
    'INSERT INTO sessions_utilisateur (utilisateur_id, token_session, date_expiration, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
    [user.id, sessionToken, expirationDate, ipAddress, userAgent]
  );

  const { mot_de_passe_hash, ...userWithoutPassword } = user;
  res.json({
    success: true,
    user: userWithoutPassword,
    token: jwtToken,
    sessionToken: sessionToken,
    expiresIn: SESSION_DURATION_HOURS * 3600, // en secondes
    message: 'Connexion réussie'
  });
}));

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { email, password, full_name, role = 'user', phone } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await pool.query('SELECT id FROM utilisateurs WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
  }

  // Hasher le mot de passe
  const passwordHash = password; // Pas de hashage pour l'instant

  // Insérer le nouvel utilisateur
  const result = await pool.query(
    'INSERT INTO utilisateurs (email, mot_de_passe_hash, role) VALUES ($1, $2, $3) RETURNING id, email, mot_de_passe_hash, role',
    [email, passwordHash, role]
  );

  const { mot_de_passe_hash, ...userWithoutPassword } = result.rows[0];

  res.json({
    success: true,
    user: userWithoutPassword,
    message: 'Inscription réussie'
  });
}));

// Routes des rapports
app.get('/api/reports', asyncHandler(async (req, res) => {
  const { statut, gravite, utilisateur_id } = req.query;

  let query = 'SELECT id, utilisateur_id, latitude, longitude, gravite, description, statut, longueur_km, surface_m2, budget, entreprise, date_creation, date_mise_a_jour FROM routes_endommagees';
  const params = [];
  const conditions = [];

  if (statut) {
    conditions.push(`statut = $${params.length + 1}`);
    params.push(statut);
  }

  if (gravite) {
    conditions.push(`gravite = $${params.length + 1}`);
    params.push(gravite);
  }

  if (utilisateur_id) {
    conditions.push(`utilisateur_id = $${params.length + 1}`);
    params.push(utilisateur_id);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY date_creation DESC';

  console.log('🔍 Requête SQL:', query);
  console.log('🔍 Paramètres:', params);

  const result = await pool.query(query, params);

  // Convertir au format attendu par le frontend
  const convertedData = result.rows.map(row => ({
    id: row.id,
    user_id: row.utilisateur_id,
    title: `Route endommagée - ${row.gravite}`,
    description: row.description || `Route de ${row.longueur_km || 0}km endommagée`,
    status: row.statut === 'nouveau' ? 'reported' :
      row.statut === 'verifie' ? 'in_progress' :
        row.statut === 'en_cours' ? 'in_progress' : 'completed',
    priority: row.gravite === 'critique' ? 'urgent' :
      row.gravite === 'elevee' ? 'high' :
        row.gravite === 'moyenne' ? 'medium' : 'low',
    latitude: row.latitude,
    longitude: row.longitude,
    location_name: `Position: ${row.latitude}, ${row.longitude}`,
    created_at: row.date_creation,
    updated_at: row.date_mise_a_jour
  }));

  res.json({ success: true, data: convertedData });
}));

app.get('/api/reports/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT id, utilisateur_id, latitude, longitude, gravite, description, statut, longueur_km, surface_m2, budget, entreprise, date_creation, date_mise_a_jour FROM routes_endommagees WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Rapport non trouvé' });
  }

  const row = result.rows[0];
  const convertedData = {
    id: row.id,
    user_id: row.utilisateur_id,
    title: `Route endommagée - ${row.gravite}`,
    description: row.description || `Route de ${row.longueur_km || 0}km endommagée`,
    status: row.statut === 'nouveau' ? 'reported' :
      row.statut === 'verifie' ? 'in_progress' :
        row.statut === 'en_cours' ? 'in_progress' : 'completed',
    priority: row.gravite === 'critique' ? 'urgent' :
      row.gravite === 'elevee' ? 'high' :
        row.gravite === 'moyenne' ? 'medium' : 'low',
    latitude: row.latitude,
    longitude: row.longitude,
    location_name: `Position: ${row.latitude}, ${row.longitude}`,
    created_at: row.date_creation,
    updated_at: row.date_mise_a_jour
  };

  res.json({ success: true, data: convertedData });
}));

app.post('/api/reports', asyncHandler(async (req, res) => {
  const { user_id, title, description, priority = 'medium', latitude, longitude, location_name } = req.body;

  // Convertir du format frontend vers le format routes_endommagees
  const gravite = priority === 'urgent' ? 'critique' :
    priority === 'high' ? 'elevee' :
      priority === 'medium' ? 'moyenne' : 'faible';

  const statut = 'nouveau';

  const result = await pool.query(
    'INSERT INTO routes_endommagees (utilisateur_id, latitude, longitude, gravite, description, statut, date_creation, date_mise_a_jour) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
    [user_id, latitude, longitude, gravite, description, statut]
  );

  const row = result.rows[0];
  const convertedData = {
    id: row.id,
    user_id: row.utilisateur_id,
    title: `Route endommagée - ${row.gravite}`,
    description: row.description || `Route endommagée`,
    status: row.statut === 'nouveau' ? 'reported' : 'completed',
    priority: row.gravite === 'critique' ? 'urgent' :
      row.gravite === 'elevee' ? 'high' :
        row.gravite === 'moyenne' ? 'medium' : 'low',
    latitude: row.latitude,
    longitude: row.longitude,
    location_name: `Position: ${row.latitude}, ${row.longitude}`,
    created_at: row.date_creation,
    updated_at: row.date_mise_a_jour
  };

  res.json({ success: true, data: convertedData });
}));

app.put('/api/reports/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, latitude, longitude, location_name } = req.body;

  // Convertir du format frontend vers le format routes_endommagees
  let gravite, statut;

  if (priority) {
    gravite = priority === 'urgent' ? 'critique' :
      priority === 'high' ? 'elevee' :
        priority === 'medium' ? 'moyenne' : 'faible';
  }

  if (status) {
    statut = status === 'reported' ? 'nouveau' :
      status === 'in_progress' ? 'en_cours' :
        status === 'completed' ? 'termine' : 'nouveau';
  }

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (gravite !== undefined) {
    fields.push(`gravite = $${paramIndex++}`);
    values.push(gravite);
  }

  if (statut !== undefined) {
    fields.push(`statut = $${paramIndex++}`);
    values.push(statut);
  }

  if (description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(description);
  }

  if (latitude !== undefined) {
    fields.push(`latitude = $${paramIndex++}`);
    values.push(latitude);
  }

  if (longitude !== undefined) {
    fields.push(`longitude = $${paramIndex++}`);
    values.push(longitude);
  }

  if (fields.length === 0) {
    return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
  }

  fields.push(`date_mise_a_jour = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `UPDATE routes_endommagees SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Rapport non trouvé' });
  }

  const row = result.rows[0];
  const convertedData = {
    id: row.id,
    user_id: row.utilisateur_id,
    title: `Route endommagée - ${row.gravite}`,
    description: row.description || `Route endommagée`,
    status: row.statut === 'nouveau' ? 'reported' :
      row.statut === 'verifie' ? 'in_progress' :
        row.statut === 'en_cours' ? 'in_progress' : 'completed',
    priority: row.gravite === 'critique' ? 'urgent' :
      row.gravite === 'elevee' ? 'high' :
        row.gravite === 'moyenne' ? 'medium' : 'low',
    latitude: row.latitude,
    longitude: row.longitude,
    location_name: `Position: ${row.latitude}, ${row.longitude}`,
    created_at: row.date_creation,
    updated_at: row.date_mise_a_jour
  };

  res.json({ success: true, data: convertedData });
}));

app.delete('/api/reports/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM routes_endommagees WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ success: false, message: 'Rapport non trouvé' });
  }

  res.json({ success: true, message: 'Rapport supprimé' });
}));

// Routes des utilisateurs
app.get('/api/users', asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, full_name, role, phone, created_at, updated_at FROM profiles ORDER BY created_at DESC'
  );

  res.json({ success: true, data: result.rows });
}));

app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT id, email, full_name, role, phone, created_at, updated_at FROM profiles WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
  }

  res.json({ success: true, data: result.rows[0] });
}));

app.put('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { full_name, phone } = req.body;

  const result = await pool.query(
    'UPDATE profiles SET full_name = $1, phone = $2 WHERE id = $3 RETURNING id, email, full_name, role, phone, created_at, updated_at',
    [full_name, phone, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
  }

  res.json({ success: true, data: result.rows[0] });
}));

// Routes des statistiques
app.get('/api/stats/reports', authenticateToken, asyncHandler(async (req, res) => {
  const totalResult = await pool.query('SELECT COUNT(*) as count FROM routes_endommagees');
  const total = parseInt(totalResult.rows[0].count);

  const statusResult = await pool.query(
    'SELECT statut, COUNT(*) as count FROM routes_endommagees GROUP BY statut'
  );
  const byStatus = statusResult.rows.reduce((acc, row) => {
    acc[row.statut] = parseInt(row.count);
    return acc;
  }, {});

  const priorityResult = await pool.query(
    'SELECT gravite, COUNT(*) as count FROM routes_endommagees GROUP BY gravite'
  );
  const byPriority = priorityResult.rows.reduce((acc, row) => {
    acc[row.gravite] = parseInt(row.count);
    return acc;
  }, {});

  res.json({
    success: true,
    data: { total, byStatus, byPriority }
  });
}));

// Routes pour la gestion des comptes bloqués
/**
 * @swagger
 * /api/admin/unblock-user:
 *   post:
 *     summary: Débloquer un compte utilisateur
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Compte débloqué avec succès
 *       404:
 *         description: Compte non trouvé ou non bloqué
 */
app.post('/api/admin/unblock-user', authenticateToken, asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await pool.query(
    'UPDATE comptes_bloques SET est_actif = false, date_deblocage = CURRENT_TIMESTAMP WHERE email = $1 AND est_actif = true RETURNING *',
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Compte non trouvé ou non bloqué'
    });
  }

  res.json({
    success: true,
    message: 'Compte débloqué avec succès',
    data: result.rows[0]
  });
}));

/**
 * @swagger
 * /api/admin/blocked-accounts:
 *   get:
 *     summary: Lister les comptes bloqués
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des comptes bloqués
 */
app.get('/api/admin/blocked-accounts', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM comptes_bloques WHERE est_actif = true ORDER BY date_blocage DESC'
  );

  res.json({
    success: true,
    data: result.rows
  });
}));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionToken
 *             properties:
 *               sessionToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
app.post('/api/auth/logout', authenticateToken, asyncHandler(async (req, res) => {
  const { sessionToken } = req.body;

  await pool.query(
    'UPDATE sessions_utilisateur SET est_active = false WHERE token_session = $1 AND utilisateur_id = $2',
    [sessionToken, req.userId]
  );

  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
}));

/**
 * @swagger
 * /api/auth/active-sessions:
 *   get:
 *     summary: Lister les sessions actives d'un utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des sessions actives
 */
app.get('/api/auth/active-sessions', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM sessions_utilisateur WHERE utilisateur_id = $1 AND est_active = true AND date_expiration > CURRENT_TIMESTAMP ORDER BY date_creation DESC',
    [req.userId]
  );

  res.json({
    success: true,
    data: result.rows
  });
}));

/**
 * @swagger
 * /api/admin/login-attempts:
 *   get:
 *     summary: Lister les tentatives de connexion récentes
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtrer par email
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Nombre d'heures à regarder
 *     responses:
 *       200:
 *         description: Liste des tentatives de connexion
 */
app.get('/api/admin/login-attempts', authenticateToken, asyncHandler(async (req, res) => {
  const { email, hours = 24 } = req.query;

  let query = `
    SELECT * FROM tentatives_connexion 
    WHERE date_tentative > CURRENT_TIMESTAMP - INTERVAL '${hours} hours'
  `;
  const params = [];

  if (email) {
    query += ' AND email = $1';
    params.push(email);
  }

  query += ' ORDER BY date_tentative DESC';

  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows
  });
}));

// Route pour la documentation Swagger
/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Documentation API Swagger
 *     description: Accès à la documentation interactive de l'API
 *     tags: [Documentation]
 */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Admin Cloud Documentation'
}));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend admin opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Nettoyage automatique des sessions expirées (toutes les heures)
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne'
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend admin démarré sur http://localhost:${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  console.log(`📚 Documentation Swagger: http://localhost:${PORT}/api/docs`);
});
