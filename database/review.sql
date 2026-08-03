CREATE TABLE IF NOT EXISTS `review` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    service VARCHAR(30) NOT NULL,
    booster_id BIGINT UNSIGNED NULL,
    booster_name VARCHAR(60) NULL,
    rating TINYINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    view_count INT UNSIGNED NOT NULL DEFAULT 0,
    password_hash VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    -- 조회가 모두 `ORDER BY created_at DESC, id DESC` 형태라 정렬 컬럼까지
    -- 인덱스에 포함해야 파일소트 없이 커버링 스캔으로 끝난다.
    -- 단일 컬럼 인덱스는 아래 복합 인덱스의 왼쪽 접두사라 따로 두지 않는다.
    INDEX idx_review_created_id (created_at, id),
    INDEX idx_review_booster_created (booster_id, created_at, id),
    INDEX idx_review_service_created (service, created_at, id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `review`
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(200) NULL;

ALTER TABLE `review`
ADD COLUMN IF NOT EXISTS booster_id BIGINT UNSIGNED NULL;

ALTER TABLE `review`
ADD COLUMN IF NOT EXISTS booster_name VARCHAR(60) NULL;

ALTER TABLE `review`
ADD COLUMN IF NOT EXISTS view_count INT UNSIGNED NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS review_replies (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    review_id BIGINT UNSIGNED NOT NULL,
    booster_id BIGINT UNSIGNED NOT NULL,
    booster_name VARCHAR(60) NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    tier_records JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_review_replies_review_id (review_id),
    INDEX idx_review_replies_booster_id (booster_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE review_replies ADD COLUMN IF NOT EXISTS booster_name VARCHAR(60) NOT NULL DEFAULT '';
UPDATE review_replies rr
LEFT JOIN booster b ON b.id = rr.booster_id
SET rr.booster_name = COALESCE(b.name, '')
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
