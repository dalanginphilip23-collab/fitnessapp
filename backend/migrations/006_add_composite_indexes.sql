-- 006: Add composite indexes for high-traffic query patterns
-- These indexes cover the most common WHERE + ORDER BY patterns in the app.

-- sleep_logs: user_id + recorded_at (used by getTodayLatest, getGraph, getScatter, getAnalysis)
CREATE INDEX idx_sleep_logs_user_recorded ON sleep_logs (user_id, recorded_at DESC);

-- daily_stats: user_id + stat_date (used by getTodayStats, getWeeklySteps, getUserStats)
CREATE INDEX idx_daily_stats_user_date ON daily_stats (user_id, stat_date DESC);

-- food_logs: user_id + logged_at (used by getCaloriesSoFar, getTodaySummary, getFoodLogs)
CREATE INDEX idx_food_logs_user_logged ON food_logs (user_id, logged_at DESC);

-- activity_logs: user_id + created_at (used by getUserActivities, getRunHistory)
CREATE INDEX idx_activity_logs_user_created ON activity_logs (user_id, created_at DESC);

-- workout_logs: user_id + start_time (used by getLogs)
CREATE INDEX idx_workout_logs_user_start ON workout_logs (user_id, start_time DESC);

-- activity_feed_posts: user_id + created_at (used by getFeed)
CREATE INDEX idx_feed_posts_user_created ON activity_feed_posts (user_id, created_at DESC);

-- ai_insight_cache: user_id + insight_date (used by getCachedInsight)
CREATE INDEX idx_ai_cache_user_date ON ai_insight_cache (user_id, insight_date);

-- notifications: user_id + is_read (used by getUnreadCount)
CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);

-- friendships: user_id + status (used by getFeed subquery)
CREATE INDEX idx_friendships_user_status ON friendships (user_id, status);
CREATE INDEX idx_friendships_friend_status ON friendships (friend_id, status);
