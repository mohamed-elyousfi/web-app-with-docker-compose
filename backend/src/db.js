const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME || 'testdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initDb(maxRetries = 15, retryDelayMs = 4000) {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      pool = mysql.createPool(DB_CONFIG);
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log(`Connexion MySQL reussie (tentative ${attempt}/${maxRetries}).`);
      return pool;
    } catch (error) {
      if (pool) {
        await pool.end().catch(() => {});
      }
      pool = undefined;

      console.error(
        `Echec de connexion a MySQL (tentative ${attempt}/${maxRetries}) : ${error.message}`
      );

      if (attempt === maxRetries) {
        throw new Error('Impossible de se connecter a MySQL apres plusieurs tentatives.');
      }

      await sleep(retryDelayMs);
    }
  }

  throw new Error('Initialisation de la base impossible.');
}

function getPool() {
  if (!pool) {
    throw new Error('La connexion a la base de donnees n est pas initialisee.');
  }

  return pool;
}

module.exports = {
  getPool,
  initDb,
};

