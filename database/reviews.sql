CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    service VARCHAR(30) NOT NULL,
    lineup_id BIGINT UNSIGNED NULL,
    lineup_name VARCHAR(60) NULL,
    rating TINYINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    view_count INT UNSIGNED NOT NULL DEFAULT 0,
    password_hash VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_reviews_created_at (created_at),
    INDEX idx_reviews_lineup_id (lineup_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(200) NULL;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS lineup_id BIGINT UNSIGNED NULL;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS lineup_name VARCHAR(60) NULL;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS view_count INT UNSIGNED NOT NULL DEFAULT 0;

ALTER TABLE reviews DROP COLUMN IF EXISTS image_data;
ALTER TABLE reviews DROP COLUMN IF EXISTS image_url;

CREATE TABLE IF NOT EXISTS review_replies (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    review_id BIGINT UNSIGNED NOT NULL,
    lineup_id BIGINT UNSIGNED NOT NULL,
    booster_name VARCHAR(60) NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    tier_records JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_review_replies_review_id (review_id),
    INDEX idx_review_replies_lineup_id (lineup_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE review_replies ADD COLUMN IF NOT EXISTS booster_name VARCHAR(60) NOT NULL DEFAULT '';
UPDATE review_replies rr
LEFT JOIN lineups l ON l.id = rr.lineup_id
SET rr.booster_name = COALESCE(l.name, '')
WHERE rr.booster_name = '';
SET @legacy_reply_name_column = (
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'review_replies'
      AND COLUMN_NAME <> 'booster_name'
      AND COLUMN_NAME REGEXP '_name$'
    ORDER BY ORDINAL_POSITION
    LIMIT 1
);
SET @drop_legacy_reply_name_sql = IF(
    @legacy_reply_name_column IS NULL,
    'SELECT 1',
    CONCAT(
        'ALTER TABLE review_replies DROP COLUMN `',
        REPLACE(@legacy_reply_name_column, '`', '``'),
        '`'
    )
);
PREPARE drop_legacy_reply_name_statement FROM @drop_legacy_reply_name_sql;
EXECUTE drop_legacy_reply_name_statement;
DEALLOCATE PREPARE drop_legacy_reply_name_statement;
ALTER TABLE review_replies ADD COLUMN IF NOT EXISTS tier_records JSON NULL;

CREATE TABLE IF NOT EXISTS review_rate_limits (
    ip_hash CHAR(64) NOT NULL,
    last_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ip_hash),
    INDEX idx_review_rate_limits_last_created_at (last_created_at)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
