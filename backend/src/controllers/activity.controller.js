const activityService = require('../services/activity.service');

async function save(req, res) {
  const { userId, duration, distance, pace, calories, route } = req.body;

  try {
    await activityService.saveActivity({ userId, duration, distance, pace, calories, route });

    res.json({
      success: true,
      message: 'Activity saved successfully'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

async function getStats(req, res) {
  const { userId } = req.params;

  try {
    const stats = await activityService.getUserStats(userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
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

    res.json({
      ...activity,
      route: JSON.parse(activity.route)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
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
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    await activityService.deleteActivity(id);

    res.json({
      success: true,
      message: 'Activity deleted'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

module.exports = { save, getStats, getDetail, getAllForUser, remove };
