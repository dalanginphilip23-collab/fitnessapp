-- Add emoji column to food_logs for manual meal logging
ALTER TABLE food_logs ADD COLUMN emoji VARCHAR(10) DEFAULT NULL AFTER image_url;
