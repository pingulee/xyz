CREATE TABLE IF NOT EXISTS champions (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  riot_id          VARCHAR(80) NOT NULL,
  riot_key         VARCHAR(16) NOT NULL,
  name             VARCHAR(60) NOT NULL,
  ddragon_version  VARCHAR(20) NOT NULL,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_champions_riot_id (riot_id),
  INDEX idx_champions_active_name (active, name)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
