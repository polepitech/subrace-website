/**
 * Calcule les points pour une position donnée
 * - Points de base : 40000 - position (premier = 40000, dernier = 0)
 * - Bonus podium : positions 1-10 reçoivent un bonus (10000, 7000, 5000, 4000, 3000, 2000, 1500, 1000, 500, 250)
 * 
 * @param position - Position dans la course (1, 2, 3, ...)
 * @returns Total des points (base + bonus si applicable)
 */
export function calculatePoints(position: number): number {
  // Points de base : 40000 - position (minimum 0)
  const basePoints = Math.max(0, 40000 - position);

  // Bonus podium pour les positions 1 à 10
  const podiumBonuses: { [key: number]: number } = {
    1: 10000,
    2: 7000,
    3: 5000,
    4: 4000,
    5: 3000,
    6: 2000,
    7: 1500,
    8: 1000,
    9: 500,
    10: 250
  };

  const bonus = podiumBonuses[position] || 0;

  return basePoints + bonus;
}

