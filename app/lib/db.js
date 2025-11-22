import mysql from 'mysql2/promise';
import 'dotenv/config';

// Créer un pool de connexions MySQL partagé
// Le pool réutilise les connexions existantes au lieu d'en créer de nouvelles
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: 'SubRace',
  waitForConnections: true,
  connectionLimit: 10, // Limite de 10 connexions simultanées
  queueLimit: 0, // Pas de limite sur la file d'attente
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export default pool;

