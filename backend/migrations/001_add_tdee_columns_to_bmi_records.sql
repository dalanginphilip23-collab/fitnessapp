ALTER TABLE `bmi_records`
  ADD COLUMN `age` int(11) DEFAULT NULL AFTER `bmi_category`,
  ADD COLUMN `activity_level` varchar(50) DEFAULT NULL AFTER `age`,
  ADD COLUMN `bmr` int(11) DEFAULT NULL AFTER `activity_level`,
  ADD COLUMN `tdee` int(11) DEFAULT NULL AFTER `bmr`;
