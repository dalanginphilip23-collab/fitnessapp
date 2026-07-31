const profileService = require('../services/profile.service');

// PUT /api/profile/update
async function updateProfile(req, res) {
  const userId = req.user.id;
  const { fullName, contact, bio, avatar_url } = req.body;

  if (!fullName) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  console.log('updating profile for user:', userId);
  console.log('avatar size:', avatar_url ? avatar_url.length : 0, 'chars');

  try {
    await profileService.updateUserName(userId, fullName);

    // FIX: height_cm / weight_kg are intentionally NOT part of this
    // update anymore. They're owned by the BMI page (POST /api/bmi/:userId),
    // which upserts them into user_profiles. Touching them here would
    // overwrite that data with null every time the user saves their
    // name/contact/bio/avatar.
    await profileService.upsertProfileDetails(userId, contact, bio, avatar_url);

    const saved = await profileService.getSavedAvatar(userId);
    console.log('avatar saved, length in db:', saved[0]?.avatar_url?.length ?? 0);

    res.json({ success: true, message: 'Profile Synchronized' });

  } catch (err) {
    console.error('profile update error:', err.code, err.message);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/profile/:userId
async function getProfile(req, res) {
  const { userId } = req.params;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    // height_cm / weight_kg still selected here — Profile page reads
    // them read-only; they're written only from the BMI page.
    const rows = await profileService.getProfile(userId);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('fetched profile for user:', userId);

    res.json(rows[0]);

  } catch (err) {
    console.error('profile fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { updateProfile, getProfile };
