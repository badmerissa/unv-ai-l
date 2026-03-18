-- Migration: Dynamic Image Rotation
-- Adds columns and tables needed for automated, infinite image cycling.

-- Extend images table with management columns
ALTER TABLE images ADD COLUMN fetched_at TEXT DEFAULT (datetime('now'));
ALTER TABLE images ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
ALTER TABLE images ADD COLUMN last_used_date TEXT DEFAULT NULL;
ALTER TABLE images ADD COLUMN use_count INTEGER NOT NULL DEFAULT 0;

-- Index for efficient least-recently-used queries
CREATE INDEX IF NOT EXISTS idx_images_active_type ON images(is_active, type, use_count, last_used_date);

-- Explicit daily set assignments — one row per calendar day.
-- image_ids is a JSON array of image IDs in display order.
CREATE TABLE IF NOT EXISTS daily_sets (
    play_date TEXT PRIMARY KEY,   -- 'YYYY-MM-DD' UTC
    image_ids TEXT NOT NULL,      -- e.g. '[3, 17, 42, 8, 55]'
    created_at TEXT DEFAULT (datetime('now'))
);

-- Configurable image sources for the automated fetcher.
-- Each row describes one subreddit (or future external source).
CREATE TABLE IF NOT EXISTS image_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL DEFAULT 'reddit',
    image_type TEXT NOT NULL,          -- 'Real' or 'AI'
    config TEXT NOT NULL,              -- JSON: {"subreddit": "..."}
    last_fetched_at TEXT DEFAULT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);

-- Default image sources (Reddit)
INSERT INTO image_sources (source_type, image_type, config) VALUES
    ('reddit', 'Real', '{"subreddit":"itookapicture"}'),
    ('reddit', 'Real', '{"subreddit":"EarthPorn"}'),
    ('reddit', 'AI',   '{"subreddit":"midjourney"}'),
    ('reddit', 'AI',   '{"subreddit":"StableDiffusion"}');
