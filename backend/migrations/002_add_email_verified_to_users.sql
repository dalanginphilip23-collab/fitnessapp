-- Migration 002 — Add email verification support
--
-- Date: 2026-08-10
-- Purpose: Track whether a user has confirmed their email address. New
--          registrations start unverified (0); the email must be verified
--          before login is allowed.
--
-- Existing users are backfilled to 1 (verified) so nobody who registered
-- before this feature existed gets locked out of their account.

ALTER TABLE `users`
  ADD COLUMN `email_verified` tinyint(1) NOT NULL DEFAULT 0 AFTER `is_online`;

-- Existing accounts were created before verification existed — treat them as verified.
UPDATE `users` SET `email_verified` = 1 WHERE `email_verified` = 0;

-- Verification query (run after applying):
-- SELECT email, email_verified FROM users LIMIT 10;
