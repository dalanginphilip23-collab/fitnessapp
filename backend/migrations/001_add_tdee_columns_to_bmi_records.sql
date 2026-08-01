-- Migration 001 — HISTORICAL / SUPERSEDED as of 2026-08-01
-- These columns are now included directly in 000_baseline_schema.sql, so
-- a fresh database setup only needs to run 000 — do NOT run this file
-- after 000, it will error with "Duplicate column name". This file is
-- kept only as a record of when/why the columns were added.
--
-- Date: 2026-07-27
-- Author: (your name)
-- Purpose: Add age, activity_level, bmr, and tdee columns to bmi_records
--          to support the BMR/TDEE calorie estimation feature added to
--          bmi.controller.js and bmi.service.js.
--
-- Context: The application code was updated to calculate and store BMR/TDEE
--          alongside BMI, but the production database schema was never
--          migrated to match — causing "Unknown column 'age' in field list"
--          errors on POST /api/bmi/:userId.
--
-- Safe to re-run notes: MySQL/MariaDB does not support "ADD COLUMN IF NOT
--          EXISTS" cleanly in older versions, so if you're unsure whether
--          this has already been applied, run the columns individually and
--          skip any that error with "Duplicate column name".

ALTER TABLE `bmi_records`
  ADD COLUMN `age` int(11) DEFAULT NULL AFTER `bmi_category`,
  ADD COLUMN `activity_level` varchar(50) DEFAULT NULL AFTER `age`,
  ADD COLUMN `bmr` int(11) DEFAULT NULL AFTER `activity_level`,
  ADD COLUMN `tdee` int(11) DEFAULT NULL AFTER `bmr`;

-- Verification query (run after applying):
-- SELECT GROUP_CONCAT(COLUMN_NAME ORDER BY ORDINAL_POSITION SEPARATOR ', ') AS all_columns
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'bmi_records';
--
-- Expected result should include: ..., age, activity_level, bmr, tdee, ...
