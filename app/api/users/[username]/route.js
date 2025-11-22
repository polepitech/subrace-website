import mysql from 'mysql2/promise';
import 'dotenv/config';
import { validateLocalhost, getLocalhostCorsHeaders } from '../../../utils/security';

export async function GET(request, { params }) {
  try {
    // Vérifier que la requête provient de localhost
    const localhostError = validateLocalhost(request);
    if (localhostError) {
      return localhostError;
    }
    // Dans Next.js 16, params peut être une Promise
    let resolvedParams = params;
    if (params && typeof params.then === 'function') {
      resolvedParams = await params;
    }
    const rawUsername = resolvedParams.username;

    // Validation stricte du username
    if (!rawUsername || typeof rawUsername !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid username' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Valider que le username ne contient que des caractères autorisés et respecte la longueur
    // Autoriser : lettres, chiffres, tirets, underscores, points
    // Longueur : entre 1 et 50 caractères
    const usernameRegex = /^[a-zA-Z0-9._-]{1,50}$/;
    if (!usernameRegex.test(rawUsername)) {
      return new Response(JSON.stringify({ error: 'Invalid username format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const username = rawUsername;

    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: 'SubRace'
    });

    // Récupère les informations du follower
    const [followerRows] = await connection.execute(
      'SELECT * FROM followers WHERE username = ?',
      [username]
    );

    if (followerRows.length === 0) {
      await connection.end();
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const follower = followerRows[0];

    // Récupère toutes les positions de ce follower avec les infos des courses
    const [positions] = await connection.execute(`
      SELECT 
        fp.race_id,
        fp.position,
        r.id,
        r.day,
        r.type
      FROM follower_positions fp
      INNER JOIN races r ON fp.race_id = r.id
      WHERE fp.followers_id = ?
      ORDER BY fp.race_id DESC
    `, [follower.id]);

    // Retourne les données brutes pour que le front puisse générer le nom
    const positionsWithRaceData = positions.map(pos => ({
      race_id: pos.race_id,
      position: pos.position,
      race_id_full: pos.id,
      race_day: pos.day,
      race_type: pos.type
    }));

    // Calcule les statistiques
    const totalRaces = positionsWithRaceData.length;
    // Utilise directement le score stocké dans la table followers
    const totalPoints = parseInt(follower.score) || 0;

    const podiums = positionsWithRaceData.filter(p => p.position <= 3).length;
    const victories = positionsWithRaceData.filter(p => p.position === 1).length;
    const bestPosition = positionsWithRaceData.length > 0 ? Math.min(...positionsWithRaceData.map(p => p.position)) : null;
    const averagePosition = positionsWithRaceData.length > 0 
      ? positionsWithRaceData.reduce((sum, p) => sum + p.position, 0) / positionsWithRaceData.length 
      : null;

    // Calcule le rang global en utilisant le même tri que /api/leaderboard
    // Compte les utilisateurs qui ont un score supérieur OU le même score mais un username qui vient avant
    // Filtre uniquement les utilisateurs avec score > 0 comme dans /api/leaderboard
    const [rankRows] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM followers f
      WHERE f.score > 0
        AND (f.score > ? 
         OR (f.score = ? AND f.username < ?))
    `, [follower.score, follower.score, follower.username]);
    
    // Si l'utilisateur a un score > 0, son rang est le nombre d'utilisateurs avant lui + 1
    // Sinon, il n'est pas dans le classement
    const globalRank = (parseInt(follower.score) || 0) > 0 && rankRows[0]?.count !== undefined 
      ? rankRows[0].count + 1 
      : null;

    await connection.end();

    const result = {
      follower: {
        id: follower.id,
        username: follower.username,
        img: `/api/images/avatars/${follower.username}.jpg`
      },
      stats: {
        totalRaces,
        totalPoints,
        podiums,
        victories,
        bestPosition,
        averagePosition: averagePosition ? Math.round(averagePosition * 10) / 10 : null,
        globalRank: globalRank
      },
      races: positionsWithRaceData
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getLocalhostCorsHeaders(),
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Database error'
      : error.message;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...getLocalhostCorsHeaders(),
      },
    });
  }
}

