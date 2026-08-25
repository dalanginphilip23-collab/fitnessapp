-- Migration 004 — Unify Plans ↔ Camera Workout catalog
-- Date: 2026-08-25
-- Purpose: Add exercise_slug to plan_exercises so Plans exercises can map to
--   camera-trackable slugs (22 in WORKOUT_OPTIONS) matching frontend/src/constants/exerciseRegistry.js
--   and backend/src/utils/exerciseSlug.js. Null = mobility/rest (not trackable).

ALTER TABLE `plan_exercises` ADD COLUMN `exercise_slug` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `exercise_name`;
CREATE INDEX `idx_exercise_slug` ON `plan_exercises` (`exercise_slug`);

-- Backfill — tracked slugs
UPDATE `plan_exercises` SET `exercise_slug`='squat' WHERE exercise_name IN ('Barbell Back Squat','Back Squat','Bodyweight Squats','Goblet Squats','Jump Squats','Front Squat','Bulgarian Split Squat','Leg Press');
UPDATE `plan_exercises` SET `exercise_slug`='pushup' WHERE exercise_name IN ('Flat Barbell Bench Press','Barbell Bench Press','Push-Ups','Push-Up to Renegade Row','Incline Dumbbell Press','Bench Press','Weighted Pushup');
UPDATE `plan_exercises` SET `exercise_slug`='pullup' WHERE exercise_name IN ('Bent-Over Barbell Row','Barbell Bent-Over Row','Single-Arm Dumbbell Row','Assisted Pull-Up or Inverted Row','Weighted Pull-Ups','Seated Cable Row','Resistance Band Rows');
UPDATE `plan_exercises` SET `exercise_slug`='plank' WHERE exercise_name IN ('Plank Hold','Weighted Plank','Plank Shoulder Taps','Plank');
UPDATE `plan_exercises` SET `exercise_slug`='sideplank' WHERE exercise_name='Side Plank';
UPDATE `plan_exercises` SET `exercise_slug`='overhead' WHERE exercise_name IN ('Standing Overhead Press','Standing Barbell Overhead Press');
UPDATE `plan_exercises` SET `exercise_slug`='deadlift' WHERE exercise_name IN ('Conventional Deadlift','Romanian Deadlift');
UPDATE `plan_exercises` SET `exercise_slug`='dip' WHERE exercise_name IN ('Weighted Dips','Dips');
UPDATE `plan_exercises` SET `exercise_slug`='tricep_ext' WHERE exercise_name='Triceps Rope Pushdown';
UPDATE `plan_exercises` SET `exercise_slug`='lateral_raise' WHERE exercise_name IN ('Cable Lateral Raise','Lateral Raise');
UPDATE `plan_exercises` SET `exercise_slug`='bicep_curl' WHERE exercise_name IN ('Barbell Bicep Curl');
UPDATE `plan_exercises` SET `exercise_slug`='lunge' WHERE exercise_name IN ('Walking Lunges','Deep Lunge Hip Opener');
UPDATE `plan_exercises` SET `exercise_slug`='hip_thrust' WHERE exercise_name IN ('Hip Thrust','Kettlebell Swings');
UPDATE `plan_exercises` SET `exercise_slug`='glute_bridge' WHERE exercise_name IN ('Glute Bridges','Glute Bridge');
UPDATE `plan_exercises` SET `exercise_slug`='boxjump' WHERE exercise_name='Box Jumps';
UPDATE `plan_exercises` SET `exercise_slug`='burpee' WHERE exercise_name='Burpees';
UPDATE `plan_exercises` SET `exercise_slug`='jumpingjack' WHERE exercise_name='Jumping Jacks';
UPDATE `plan_exercises` SET `exercise_slug`='mountainclimb' WHERE exercise_name='Mountain Climbers';
UPDATE `plan_exercises` SET `exercise_slug`='highknee' WHERE exercise_name IN ('High Knees','Sprint Intervals','Hill Sprints or Resisted Intervals');
UPDATE `plan_exercises` SET `exercise_slug`='crunch' WHERE exercise_name IN ('Crunches','Hanging Knee Raise','Hanging Leg Raise','Dead Bug');
UPDATE `plan_exercises` SET `exercise_slug`='situp' WHERE exercise_name='Sit-Ups';
UPDATE `plan_exercises` SET `exercise_slug`='calfraise' WHERE exercise_name IN ('Standing Calf Raise','Calf Raises');

-- Superset / combo entries — map to first component's slug
UPDATE `plan_exercises` SET `exercise_slug`='pushup' WHERE exercise_name LIKE '%Incline DB Press%' OR exercise_name LIKE '%Chest-Supported Row%';
UPDATE `plan_exercises` SET `exercise_slug`='overhead' WHERE exercise_name LIKE '%DB Shoulder Press%';
UPDATE `plan_exercises` SET `exercise_slug`='pullup' WHERE exercise_name LIKE '%Cable Fly%';

-- Leave mobility/rest as NULL (explicitly not trackable)
-- Includes: World's Greatest Stretch, Foam Rolling, Hip 90/90, Thoracic, Light Cycling, etc. -> NULL

-- Verification:
-- SELECT exercise_name, exercise_slug, COUNT(*) FROM plan_exercises GROUP BY exercise_name, exercise_slug ORDER BY exercise_name;
