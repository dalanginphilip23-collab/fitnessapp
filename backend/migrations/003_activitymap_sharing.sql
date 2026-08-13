-- Migration 003 — ActivityMap sharing & pins
--
-- Date: 2026-08-10
-- Purpose: Support the Strava-style ActivityMap redesign:
--   1. Enrich activity_logs so each run/walk/jog/hike can carry an activity
--      type, a user-facing title, a reverse-geocoded place name, a public/
--      private flag, and a unique share token used for public share links.
--   2. Add saved_pins so users can drop and persist custom location pins
--      (favorite running spots, waypoints, etc.).
--   3. Add activity_feed_posts so users can post activities to an in-app
--      feed that friends (friendships table) can see.
--
-- Safe to re-run notes: run once against both dev and prod databases.
--   If a statement errors with "Duplicate column name" or "Table already
--   exists", the migration (or part of it) is already applied — safe to skip.

-- 1. activity_logs — new columns for the redesigned ActivityMap
ALTER TABLE `activity_logs`
  ADD COLUMN `type` varchar(20) NOT NULL DEFAULT 'run' AFTER `user_id`,
  ADD COLUMN `title` varchar(120) DEFAULT NULL AFTER `type`,
  ADD COLUMN `place_name` varchar(180) DEFAULT NULL AFTER `title`,
  ADD COLUMN `is_public` tinyint(1) NOT NULL DEFAULT 0 AFTER `place_name`,
  ADD COLUMN `share_token` char(24) DEFAULT NULL AFTER `is_public`;

-- Unique index on the share token — a random, unguessable token is the
-- access mechanism for public "secret link" sharing.
ALTER TABLE `activity_logs`
  ADD UNIQUE KEY `idx_share_token` (`share_token`);

-- 2. saved_pins — user-dropped custom location pins
CREATE TABLE IF NOT EXISTS `saved_pins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(10,8) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `saved_pins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. activity_feed_posts — in-app social feed of shared activities
CREATE TABLE IF NOT EXISTS `activity_feed_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `caption` varchar(280) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_activity_id` (`activity_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `activity_feed_posts_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activity_logs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_feed_posts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification queries (run after applying):
--   SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'activity_logs';
--   SHOW TABLES LIKE 'saved_pins';
--   SHOW TABLES LIKE 'activity_feed_posts';
