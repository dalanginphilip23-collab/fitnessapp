const activityService = require('../services/activity.service');

async function save(req, res) {
  const {
    userId, duration, distance, pace, calories, route,
    type, title, placeName, isPublic, postToFeed, caption,
  } = req.body;

  try {
    const saved = await activityService.saveActivity({
      userId, duration, distance, pace, calories, route,
      type, title, place_name: placeName, is_public: isPublic, postToFeed, caption,
    });

    res.json({
      success: true,
      message: 'Activity saved successfully',
      activityId: saved.id,
      shareToken: saved.share_token,
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
    const activity = await activityService.getActivityDetail(id, req.user.id);

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
    const [result] = await activityService.deleteActivity(id, req.user.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

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

// ─── Public share link (no auth) ─────────────────────────────────────────────
async function getShared(req, res) {
  const { token } = req.params;

  try {
    const activity = await activityService.getByShareToken(token);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or not public'
      });
    }

    res.json({
      success: true,
      ...activity,
      route: JSON.parse(activity.route || '[]'),
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

async function togglePublic(req, res) {
  const { id } = req.params;
  const { userId, isPublic } = req.body;

  try {
    const row = await activityService.setPublic(id, userId, isPublic);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.json({ success: true, shareToken: row.share_token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Feed ────────────────────────────────────────────────────────────────────
async function getFeed(req, res) {
  const { userId } = req.params;

  try {
    const feed = await activityService.getFeed(userId);
    res.json(feed);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function removeFeedPost(req, res) {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const deleted = await activityService.deleteFeedPost(postId, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Post an existing (already saved) activity to the feed
async function createFeed(req, res) {
  const { activityId } = req.params;
  const { userId, caption } = req.body;

  try {
    await activityService.createFeedPost(activityId, userId, caption || null);
    res.json({ success: true, message: 'Posted to feed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Saved pins ──────────────────────────────────────────────────────────────
async function getPins(req, res) {
  const { userId } = req.params;

  try {
    const pins = await activityService.listPins(userId);
    res.json(pins);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createPin(req, res) {
  const { userId } = req.params;
  const { name, latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
  }

  try {
    const pin = await activityService.addPin(userId, { name, latitude, longitude });
    res.json({ success: true, pin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function removePin(req, res) {
  const { id, userId } = req.params;

  try {
    const deleted = await activityService.deletePin(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Pin not found' });
    }
    res.json({ success: true, message: 'Pin deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  save, getStats, getDetail, getAllForUser, remove,
  getShared, togglePublic,
  getFeed, createFeed, removeFeedPost,
  getPins, createPin, removePin,
};
