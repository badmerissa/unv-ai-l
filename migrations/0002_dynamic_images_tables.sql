-- Migration: Dynamic Image Rotation (Part 2 — tables only)
-- Run this because Part 1 already applied the ALTER TABLE column additions.

-- Index for efficient least-recently-used queries
CREATE INDEX IF NOT EXISTS idx_images_active_type ON images(is_active, type, use_count, last_used_date);

-- Explicit daily set assignments — one row per calendar day.
CREATE TABLE IF NOT EXISTS daily_sets (
    play_date TEXT PRIMARY KEY,
    image_ids TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Configurable image sources for the automated fetcher.
CREATE TABLE IF NOT EXISTS image_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL DEFAULT 'reddit',
    image_type TEXT NOT NULL,
    config TEXT NOT NULL,
    last_fetched_at TEXT DEFAULT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);

-- Default Reddit sources
INSERT INTO image_sources (source_type, image_type, config) VALUES
    ('reddit', 'Real', '{"subreddit":"itookapicture"}'),
    ('reddit', 'Real', '{"subreddit":"EarthPorn"}'),
    ('reddit', 'AI',   '{"subreddit":"midjourney"}'),
    ('reddit', 'AI',   '{"subreddit":"StableDiffusion"}');
