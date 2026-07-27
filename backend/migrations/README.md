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
| 000 | 000_baseline_schema.sql | 2026-06-17 | Full baseline schema — all 26 tables (users, workouts, social, coaching, plans, etc.), indexes, foreign keys, and seed data for the workout plans catalog. Extracted from `backend/docs/fitnessapp_db.sql`. Running this on an empty database recreates the full starting schema. | N/A — already live; use only to set up a fresh/local database |
| 001 | 001_add_tdee_columns_to_bmi_records.sql | 2026-07-27 | Added `age`, `activity_level`, `bmr`, `tdee` to `bmi_records` for TDEE/calorie feature | ✅ Yes |

### What's covered in 000 (all 26 tables)

`users`, `doctors`, `plans`, `activity_logs`, `ai_insight_cache`,
`biometric_logs`, `bmi_records`, `chat_sessions`, `daily_stats`,
`food_logs`, `friendships`, `messages`, `notifications`,
`password_reset_otps`, `plan_contents`, `sleep_logs`, `user_plans`,
`user_plan_progress`, `user_profiles`, `user_sessions`, `workout_logs`,
`workout_sessions`, `coaching_sessions`, `clinic_messages`,
`coaching_reps`, `plan_exercises`

Seed/reference data included: the 6 workout plans and their day-by-day
content and exercises (this is catalog data the app needs to function,
not user-generated data — no real user rows, logs, or messages are
included).

---

**Rule of thumb:** if you ever type `ALTER TABLE` directly into a database
console without also creating a file here, stop and make the file first.
Future-you (and your capstone panel) will thank you.
