import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

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

// Routes d'authentification
app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    'SELECT email, mot_de_passe_hash, role FROM utilisateurs WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }

  const user = result.rows[0];
  const isValidPassword = password === user.mot_de_passe_hash;

  if (!isValidPassword) {
    return res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }

  const { mot_de_passe_hash, ...userWithoutPassword } = user;
  res.json({
    success: true,
    user: userWithoutPassword,
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
app.get('/api/stats/reports', asyncHandler(async (req, res) => {
  const totalResult = await pool.query('SELECT COUNT(*) as count FROM reports');
  const total = parseInt(totalResult.rows[0].count);

  const statusResult = await pool.query(
    'SELECT status, COUNT(*) as count FROM reports GROUP BY status'
  );
  const byStatus = statusResult.rows.reduce((acc, row) => {
    acc[row.status] = parseInt(row.count);
    return acc;
  }, {});

  const priorityResult = await pool.query(
    'SELECT priority, COUNT(*) as count FROM reports GROUP BY priority'
  );
  const byPriority = priorityResult.rows.reduce((acc, row) => {
    acc[row.priority] = parseInt(row.count);
    return acc;
  }, {});

  res.json({
    success: true,
    data: { total, byStatus, byPriority }
  });
}));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend admin opérationnel',
    timestamp: new Date().toISOString()
  });
});

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
});
