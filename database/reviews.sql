CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    service VARCHAR(30) NOT NULL,
    lineup_id BIGINT UNSIGNED NULL,
    lineup_name VARCHAR(60) NULL,
    rating TINYINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255) NULL,
    password_hash VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_reviews_created_at (created_at),
    INDEX idx_reviews_lineup_id (lineup_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(200) NULL;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS lineup_id BIGINT UNSIGNED NULL;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS lineup_name VARCHAR(60) NULL;

ALTER TABLE reviews DROP COLUMN IF EXISTS image_data;

CREATE TABLE IF NOT EXISTS review_rate_limits (
    ip_hash CHAR(64) NOT NULL,
    last_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ip_hash),
    INDEX idx_review_rate_limits_last_created_at (last_created_at)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;