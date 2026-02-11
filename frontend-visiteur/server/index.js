const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Configuration CORS
app.use(cors());
app.use(express.json());

// Configuration base de données
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'road_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Test connexion
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('Connecté à la base de données PostgreSQL:', res.rows[0].now);
  }
});

// Routes API
app.get('/api/routes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes_endommagees ORDER BY date_creation DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des routes:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/routes', async (req, res) => {
  try {
    const { utilisateur_id, latitude, longitude, gravite, description, statut } = req.body;
    const result = await pool.query(
      'INSERT INTO routes_endommagees (utilisateur_id, latitude, longitude, gravite, description, statut) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [utilisateur_id, latitude, longitude, gravite, description, statut || 'signale']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de l\'ajout d\'une route:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, role FROM utilisateurs');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
