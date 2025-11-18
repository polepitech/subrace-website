# Scripts de migration

## Création de la table follower_positions

### Étape 1 : Créer la table

Exécutez le script SQL pour créer la table optimisée :

```bash
mysql -u root -p SubRace < scripts/create_follower_positions_table.sql
```

Ou via votre client MySQL préféré (phpMyAdmin, MySQL Workbench, etc.) en exécutant le contenu du fichier `create_follower_positions_table.sql`.

### Structure de la table

La table `follower_positions` contient :
- `id` : Clé primaire auto-incrémentée
- `race_id` : ID de la course (clé étrangère vers `races`)
- `followers_id` : ID du follower (clé étrangère vers `followers`)
- `position` : Position dans la course (1 = premier, 2 = deuxième, etc.)
- `created_at` / `updated_at` : Timestamps automatiques

**Contraintes d'unicité :**
- Un follower ne peut avoir qu'une seule position par course
- Une position ne peut être occupée que par un seul follower par course

**Index pour performances :**
- Index sur `race_id`, `followers_id`, `position`
- Index composite sur `(race_id, position)`

## Migration des données

### Étape 2 : Migrer les données depuis raceResults

Le script de migration lit toutes les courses avec leur champ `raceResults` (JSON) et les convertit en entrées dans la table `follower_positions`.

**Formats supportés de `raceResults` :**

1. **Tableau de strings** (position = index + 1) :
```json
["username1", "username2", "username3", ...]
```

2. **Tableau d'objets avec username** (position = index + 1) :
```json
[{"username":"username1"}, {"username":"username2"}, ...]
```

3. **Tableau d'objets avec username et position** (position = valeur fournie) :
```json
[{"username":"username1","position":1}, {"username":"username2","position":2}, ...]
```

Le script détecte automatiquement le format et adapte le traitement.

### Exécution

```bash
npm run migrate:positions
```

Ou directement :
```bash
node scripts/migrate_race_results.mjs
```

### Comportement du script

1. ✅ Vérifie que la table `follower_positions` existe
2. 📊 Récupère toutes les courses avec `race_result` non vide
3. 👥 Charge tous les followers dans un cache pour accès rapide
4. 🔄 Pour chaque course :
   - Parse le JSON de `race_result`
   - Vérifie si des positions existent déjà (évite les doublons)
   - Pour chaque nom dans le tableau :
     - Trouve le `followers_id` correspondant
     - Insère dans `follower_positions` avec la position (index + 1)
5. 📈 Affiche un résumé de la migration

### Notes importantes

- ⚠️ Le script **ignore** les courses qui ont déjà des positions dans `follower_positions` (évite les doublons)
- ⚠️ Les followers non trouvés sont **ignorés** avec un avertissement
- ⚠️ Les noms sont comparés en **minuscules** pour éviter les problèmes de casse
- ✅ Les insertions sont faites par batch pour de meilleures performances

### Exemple de sortie

```
✅ Connexion à la base de données établie
📊 10 course(s) trouvée(s) avec race_result
👥 150 follower(s) chargé(s) dans le cache
✅ Course 1: 45 position(s) insérée(s)
✅ Course 2: 38 position(s) insérée(s)
⏭️  Course 3: 42 position(s) déjà existante(s), ignorée
...

📈 Résumé de la migration:
   - Courses traitées: 9/10
   - Positions insérées: 387
   - Erreurs: 0

✅ Migration terminée avec succès !
```

## Vérification

Après la migration, vous pouvez vérifier les données :

```sql
-- Nombre de positions par course
SELECT race_id, COUNT(*) as positions_count 
FROM follower_positions 
GROUP BY race_id;

-- Vérifier une course spécifique
SELECT 
  fp.position,
  f.username,
  fp.race_id
FROM follower_positions fp
INNER JOIN followers f ON fp.followers_id = f.id
WHERE fp.race_id = 1
ORDER BY fp.position;
```

