-- Script SQL pour créer la table follower_positions optimisée

-- Supprime la table si elle existe déjà (attention en production !)
-- DROP TABLE IF EXISTS follower_positions;

-- Crée la table follower_positions
CREATE TABLE IF NOT EXISTS follower_positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  race_id INT NOT NULL,
  followers_id INT NOT NULL,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Contraintes de clés étrangères
  FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
  FOREIGN KEY (followers_id) REFERENCES followers(id) ON DELETE CASCADE,
  
  -- Contraintes d'unicité
  -- Un follower ne peut avoir qu'une seule position par course
  UNIQUE KEY unique_race_follower (race_id, followers_id),
  -- Une position ne peut être occupée que par un seul follower par course
  UNIQUE KEY unique_race_position (race_id, position),
  
  -- Index pour améliorer les performances des requêtes
  INDEX idx_race_id (race_id),
  INDEX idx_followers_id (followers_id),
  INDEX idx_position (position),
  INDEX idx_race_position (race_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

