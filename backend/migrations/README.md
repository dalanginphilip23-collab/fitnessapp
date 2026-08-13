# Database Migrations

This folder tracks every schema change made to the `fitnessapp` database,
in order, as individual `.sql` files. Each file represents ONE change and
is committed to git so the schema's history is documented alongside the
application code that depends on it.

## Why this exists

On 2026-07-27, the BMI feature broke in production with:

```
[BMI] Insert Error: Unknown column 'age' in 'field list'
```

The application code (`bmi.controller.js`, `bmi.service.js`) had been
updated to read/write `age`, `activity_level`, `bmr`, and `tdee` on the
`bmi_records` table, but the live database was never updated to match.
This is called **schema drift** — code and database structure falling out
of sync — and it's exactly what this folder prevents going forward.

## How to apply a migration

1. Open your database console (Render's MySQL panel, phpMyAdmin, etc.)
2. Open the next unapplied migration file in this folder, in numeric order
3. Copy its SQL and run it against the database
4. Confirm success (see the verification query in the file, if included)
5. Update the table below to mark it as applied

## How to create a new migration

When you add a feature that requires a schema change (new column, new
table, new index, etc.):

1. Create a new file: `XXX_short_description.sql`
   (increment `XXX` from the last number used — always 3 digits, e.g. `002`)
2. Write the `ALTER TABLE` / `CREATE TABLE` / etc. statement
3. Add a comment header: date, purpose, and any context worth remembering
4. Run it against the database
5. Commit the file to git
6. Add a row to the table below

## Naming convention

```
XXX_short_description.sql
```

Example: `002_add_notifications_read_index.sql`

## Migration history

| # | File | Date | Description | Applied to prod? |
|---|------|------|-------------|-------------------|
| 000 | 000_baseline_schema.sql | 2026-06-17 (updated 2026-08-14) | Full **current** schema — all 30 tables (users, workouts, social, coaching, plans, activity sharing, etc.), indexes, foreign keys, and seed data for the workout plans catalog. Includes `email_verified` (migration 002) and the activitymap changes (migration 003) folded in. Uses the `fitnessapp` database name to match `DB_NAME` in `backend/.env`. Running this on an empty database recreates the full current schema in one step — no follow-up ALTER needed. | N/A — already live; use to set up a fresh/local database |
| 001 | 001_add_tdee_columns_to_bmi_records.sql | 2026-07-27 | **Historical/superseded** — added `age`, `activity_level`, `bmr`, `tdee` to `bmi_records`. Now folded into 000; do not run on a database already set up from the updated 000. | ✅ Yes (already live in production) |
| 002 | 002_add_email_verified_to_users.sql | 2026-08-10 | Added `email_verified tinyint(1) DEFAULT 0` to `users` for email verification; existing users backfilled to 1. Now folded into 000. | ✅ Yes (already live in production) |
| 003 | 003_activitymap_sharing.sql | 2026-08-10 | ActivityMap redesign: new `activity_logs` columns (`type`, `title`, `place_name`, `is_public`, `share_token` + unique index) and two new tables `saved_pins` and `activity_feed_posts`. Now folded into 000. | ✅ Yes (already live in production) |

### What's covered in 000 (all 30 tables)

`activity_feed_posts`, `activity_logs`, `ai_insight_cache`, `biometric_logs`,
`bmi_records`, `chat_sessions`, `clinic_messages`, `coaching_reps`,
`coaching_sessions`, `daily_stats`, `doctors`, `feedback`, `food_logs`,
`friendships`, `messages`, `notifications`, `password_reset_otps`,
`plan_contents`, `plan_exercises`, `plans`, `posture_alerts`, `saved_pins`,
`sleep_logs`, `user_plan_progress`, `user_plans`, `user_profiles`,
`user_sessions`, `users`, `workout_logs`, `workout_sessions`

Seed/reference data included: the 6 workout plans and their day-by-day
content and exercises (this is catalog data the app needs to function,
not user-generated data — no real user rows, logs, or messages are
included). The baseline drops the legacy unused `is_verified` column
that existed in the old production dump — the app only uses
`email_verified`.

---

**Rule of thumb:** if you ever type `ALTER TABLE` directly into a database
console without also creating a file here, stop and make the file first.
Future-you (and your capstone panel) will thank you.
