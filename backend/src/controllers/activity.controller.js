const activityService = require('../services/activity.service');

async function save(req, res) {
  const { duration, distance, pace, calories, route } = req.body;
  const userId = req.user.id;

  if (!duration || !distance) {
    return res.status(400).json({
      success: false,
      error: 'duration and distance are required'
    });
  }

  try {
    await activityService.saveActivity({ userId, duration, distance, pace, calories, route });

    res.json({
      success: true,
      message: 'Activity saved successfully'
    });

  } catch (err) {
    console.error('[activity save] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to save activity'
    });
  }
}

async function getStats(req, res) {
  const { userId } = req.params;

  try {
    const stats = await activityService.getUserStats(userId);
    res.json(stats);
  } catch (err) {
    console.error('[activity stats] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load activity stats'
    });
  }
}

async function getDetail(req, res) {
  const { id } = req.params;

  try {
    const activity = await activityService.getActivityDetail(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    if (String(activity.user_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    res.json({
      ...activity,
      route: JSON.parse(activity.route)
    });

  } catch (err) {
    console.error('[activity detail] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load activity'
    });
  }
}

async function getAllForUser(req, res) {
  const { userId } = req.params;

  try {
    const rows = await activityService.getUserActivities(userId);

    const activities = rows.map(activity => ({
      ...activity,
      route: JSON.parse(activity.route)
    }));

    res.json(activities);

  } catch (err) {
    console.error('[activity list] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load activities'
    });
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    const activity = await activityService.getActivityDetail(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    if (String(activity.user_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    await activityService.deleteActivity(id);

    res.json({
      success: true,
      message: 'Activity deleted'
    });

  } catch (err) {
    console.error('[activity delete] Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete activity'
    });
  }
}

module.exports = { save, getStats, getDetail, getAllForUser, remove };
