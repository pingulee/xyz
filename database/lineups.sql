CREATE TABLE IF NOT EXISTS lineups (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(60)  NOT NULL,
  positions     VARCHAR(120) NOT NULL COMMENT 'comma-separated, e.g. 정글,탑',
  rank          VARCHAR(30)  NOT NULL,
  tier          VARCHAR(120) NOT NULL COMMENT 'image path',
  description   VARCHAR(300) NOT NULL DEFAULT '',
  weekday_hours VARCHAR(30)  NOT NULL DEFAULT '',
  weekend_hours VARCHAR(30)  NOT NULL DEFAULT '',
  champions     VARCHAR(300) NOT NULL DEFAULT '' COMMENT 'comma-separated',
  services      VARCHAR(120) NOT NULL DEFAULT '' COMMENT 'comma-separated',
  image_url     VARCHAR(255) NULL,
  sort_order    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_lineups_active_sort (active, sort_order)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE lineups ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL;
ALTER TABLE lineups DROP COLUMN IF EXISTS image_data;
ALTER TABLE lineups ADD COLUMN IF NOT EXISTS knight_password_hash VARCHAR(200) NULL;
