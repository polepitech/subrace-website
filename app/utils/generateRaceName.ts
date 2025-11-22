/**
 * Génère le nom d'une course avec traduction selon le type
 * 
 * @param race - Objet contenant les informations de la course
 * @param race.id - ID de la course (requis)
 * @param race.day - Numéro/jour de la course (optionnel)
 * @param race.type - Type de la course (optionnel: "week", "equal", ou autre)
 * @param race.date - Date de la course (optionnel, non utilisé actuellement)
 * @param t - Fonction de traduction de next-intl
 * @returns Le nom formaté de la course avec traduction
 */
export function generateRaceNameWithPrefix(
  race: {
    id: number;
    day?: string | number | null;
    type?: string | null;
    date?: string | null;
  },
  t: (key: string) => string
): string {
  let raceType: string;
  if (race.type === 'adl') {return `${t('races.race')} #❤️`;}
  
  if (race.type === 'week') {
    raceType = t('races.weekRace');
  } else if (race.type === 'equal') {
    raceType = t('races.equalChance');
  } else { //normal
    raceType = t('races.race');
  }
  
  return `${raceType} #${race.day}`;
}

