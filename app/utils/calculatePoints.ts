/**
 * Calcule les points pour une position donnée
 * - Points de base : 40000 - position (premier = 40000, dernier = 0)
 * - Bonus podium : positions 1-10 reçoivent un bonus (10000, 7000, 5000, 4000, 3000, 2000, 1500, 1000, 500, 250)
 * 
 * @param position - Position dans la course (1, 2, 3, ...)
 * @returns Total des points (base + bonus si applicable)
 */

/**
 * Calcule les points gagnés en fonction d'une position
 * Basé sur les règles du script calculateLeaderboard.js
 * 
 * Points de position: 40,000 - (position - 1) pour les positions 1 à 40,000, 0 pour les autres
 * Points bonus (top 10):
 *   - 1er: +30,000
 *   - 2ème: +20,000
 *   - 3ème: +10,000
 *   - 4ème: +8,000
 *   - 5ème: +6,000
 *   - 6ème: +5,000
 *   - 7ème: +4,000
 *   - 8ème: +3,000
 *   - 9ème: +2,000
 *   - 10ème: +1,000
 * 
 * @param position - Position dans la course (1 = premier)
 * @returns Points totaux (position + bonus)
 */
export function calculatePoints(position: number): number {
  const MAX_POSITION_POINTS = 40000;
  
  // Points bonus pour le top 10
  const BONUS_POINTS: { [key: number]: number } = {
    1: 30000,
    2: 20000,
    3: 10000,
    4: 8000,
    5: 6000,
    6: 5000,
    7: 4000,
    8: 3000,
    9: 2000,
    10: 1000
  };

  // Points de position
  let positionPoints = 0;
  if (position <= MAX_POSITION_POINTS) {
    positionPoints = MAX_POSITION_POINTS - (position - 1);
  }
  
  // Points bonus pour le top 10
  const bonusPoints = BONUS_POINTS[position] || 0;
  
  return positionPoints + bonusPoints;
}

