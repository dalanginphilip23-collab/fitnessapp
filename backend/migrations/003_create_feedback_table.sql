-- Migration 003 — Store feedback submissions in the database
--
-- Date: 2026-08-10
-- Purpose: Feedback currently depends entirely on Gmail SMTP, which is
--          blocked on Render's free tier (outbound ports 25/465/587).
--          Persist submissions so they are never lost; the email is still
--          attempted in the background for when SMTP becomes available.

CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `email_status` varchar(20) DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification query (run after applying):
-- SELECT id, name, email, LEFT(message, 60) AS snippet, email_status, created_at FROM feedback ORDER BY id DESC LIMIT 10;
