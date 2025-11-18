/**
 * Script de migration des données de raceResults (JSON) vers follower_positions
 * 
 * Ce script gère 3 formats de raceResults :
 * 1. Tableau de strings : ["username1", "username2", ...] (position = index + 1)
 * 2. Tableau d'objets avec username : [{"username":"user1"}, {"username":"user2"}, ...] (position = index + 1)
 * 3. Tableau d'objets avec username et position : [{"username":"user1","position":1}, ...] (position = valeur fournie)
 * 
 * Usage: node scripts/migrate_race_results.mjs
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

async function migrateRaceResults() {
  let connection;

  try {
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: 'SubRace'
    });

    console.log('✅ Connexion à la base de données établie');

    // Vérifie si la table follower_positions existe
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'SubRace' 
      AND table_name = 'follower_positions'
    `);

    if (tables[0].count === 0) {
      console.error('❌ La table follower_positions n\'existe pas. Exécutez d\'abord le script SQL create_follower_positions_table.sql');
      process.exit(1);
    }

    // Récupère toutes les courses avec raceResults
    const [races] = await connection.execute(`
      SELECT id, raceResults 
      FROM races 
      WHERE raceResults IS NOT NULL 
      AND raceResults != ''
      AND raceResults != 'null'
    `);

    console.log(`📊 ${races.length} course(s) trouvée(s) avec raceResults`);

    if (races.length === 0) {
      console.log('⚠️  Aucune course à migrer');
      await connection.end();
      return;
    }

    // Crée un map des followers par username pour accès rapide
    const [followers] = await connection.execute(`
      SELECT id, username 
      FROM followers
    `);

    const followersMap = {};
    followers.forEach(follower => {
      followersMap[follower.username.toLowerCase()] = follower.id;
    });

    console.log(`👥 ${followers.length} follower(s) chargé(s) dans le cache`);

    let totalInserted = 0;
    let totalErrors = 0;
    let racesProcessed = 0;

    // Traite chaque course
    for (const race of races) {
      try {
        // Parse le JSON
        let raceResult;
        try {
          raceResult = JSON.parse(race.raceResults);
        } catch (parseError) {
          console.error(`❌ Erreur de parsing JSON pour la course ${race.id}:`, parseError.message);
          totalErrors++;
          continue;
        }

        // Vérifie que c'est un tableau
        if (!Array.isArray(raceResult)) {
          console.error(`❌ raceResults pour la course ${race.id} n'est pas un tableau`);
          totalErrors++;
          continue;
        }

        // Vérifie si des positions existent déjà pour cette course
        const [existing] = await connection.execute(
          'SELECT COUNT(*) as count FROM follower_positions WHERE race_id = ?',
          [race.id]
        );

        if (existing[0].count > 0) {
          console.log(`⏭️  Course ${race.id}: ${existing[0].count} position(s) déjà existante(s), ignorée`);
          continue;
        }

        // Prépare les insertions
        const insertions = [];
        let defaultPosition = 1; // Position par défaut si non spécifiée

        for (let i = 0; i < raceResult.length; i++) {
          const item = raceResult[i];
          let username = null;
          let position = null;

          // Gère les différents formats
          if (typeof item === 'string') {
            // Format 1 : Tableau de strings ["username1", "username2", ...]
            username = item;
            position = defaultPosition;
            defaultPosition++;
          } else if (typeof item === 'object' && item !== null) {
            // Format 2 : Tableau d'objets avec username
            if (item.username) {
              username = item.username;
              // Format 3 : Si position est fournie, l'utiliser, sinon utiliser l'index
              position = item.position !== undefined ? item.position : defaultPosition;
              if (item.position === undefined) {
                defaultPosition++;
              }
            } else {
              console.warn(`⚠️  Objet invalide à l'index ${i} pour la course ${race.id}:`, item);
              continue;
            }
          } else {
            console.warn(`⚠️  Élément invalide à l'index ${i} pour la course ${race.id}:`, item);
            continue;
          }

          if (!username || typeof username !== 'string') {
            console.warn(`⚠️  Username invalide à la position ${position} pour la course ${race.id}:`, username);
            continue;
          }

          const followersId = followersMap[username.toLowerCase()];

          if (!followersId) {
            console.warn(`⚠️  Follower non trouvé: "${username}" (course ${race.id}, position ${position})`);
            continue;
          }

          insertions.push([race.id, followersId, position]);
        }

        // Insère toutes les positions en une seule transaction
        if (insertions.length > 0) {
          await connection.query(
            'INSERT INTO follower_positions (race_id, followers_id, position) VALUES ?',
            [insertions]
          );

          totalInserted += insertions.length;
          racesProcessed++;
          console.log(`✅ Course ${race.id}: ${insertions.length} position(s) insérée(s)`);
        } else {
          console.warn(`⚠️  Aucune position valide pour la course ${race.id}`);
        }

      } catch (error) {
        console.error(`❌ Erreur lors du traitement de la course ${race.id}:`, error.message);
        totalErrors++;
      }
    }

    // Résumé
    console.log('\n📈 Résumé de la migration:');
    console.log(`   - Courses traitées: ${racesProcessed}/${races.length}`);
    console.log(`   - Positions insérées: ${totalInserted}`);
    console.log(`   - Erreurs: ${totalErrors}`);

    if (totalInserted > 0) {
      console.log('\n✅ Migration terminée avec succès !');
    } else {
      console.log('\n⚠️  Aucune donnée n\'a été migrée');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécute la migration
migrateRaceResults()
  .then(() => {
    console.log('✨ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur non gérée:', error);
    process.exit(1);
  });

