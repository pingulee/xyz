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
  nationality   TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=대한민국, 2=중국',
  image_url     VARCHAR(255) NULL,
  sort_order    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_lineups_active_sort (active, sort_order)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE lineups ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL;
ALTER TABLE lineups ADD COLUMN IF NOT EXISTS booster_password_hash VARCHAR(200) NULL;

-- 기존 이름의 로그인 해시 컬럼이 있으면 새 컬럼으로 복사한 뒤 제거한다.
SET @legacy_password_column = (
  SELECT COLUMN_NAME
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'lineups'
    AND COLUMN_NAME <> 'booster_password_hash'
    AND COLUMN_NAME REGEXP '_password_hash$'
  ORDER BY ORDINAL_POSITION
  LIMIT 1
);
SET @password_migration_sql = IF(
  @legacy_password_column IS NULL,
  'SELECT 1',
  CONCAT(
    'UPDATE lineups SET booster_password_hash = `',
    REPLACE(@legacy_password_column, '`', '``'),
    '` WHERE booster_password_hash IS NULL AND `',
    REPLACE(@legacy_password_column, '`', '``'),
    '` IS NOT NULL'
  )
);
PREPARE password_migration_statement FROM @password_migration_sql;
EXECUTE password_migration_statement;
DEALLOCATE PREPARE password_migration_statement;
SET @drop_legacy_password_sql = IF(
  @legacy_password_column IS NULL,
  'SELECT 1',
  CONCAT(
    'ALTER TABLE lineups DROP COLUMN `',
    REPLACE(@legacy_password_column, '`', '``'),
    '`'
  )
);
PREPARE drop_legacy_password_statement FROM @drop_legacy_password_sql;
EXECUTE drop_legacy_password_statement;
DEALLOCATE PREPARE drop_legacy_password_statement;
ALTER TABLE lineups ADD COLUMN IF NOT EXISTS nationality TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=대한민국, 2=중국';
UPDATE lineups
SET nationality = CASE
  WHEN CAST(nationality AS CHAR) IN ('중국', '2') THEN 2
  ELSE 1
END;
ALTER TABLE lineups MODIFY COLUMN nationality TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=대한민국, 2=중국';
