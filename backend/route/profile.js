const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyUser = require('../middleware/verifyUser');

// PUT /api/profile/update
router.put('/update', verifyUser, async (req, res) => {
    const userId = req.user.id;
    const { fullName, contact, bio, avatar_url } = req.body;

    if (!fullName) {
        return res.status(400).json({ error: 'Full name is required' });
    }

    console.log('updating profile for user:', userId);
    console.log('avatar size:', avatar_url ? avatar_url.length : 0, 'chars');

    try {
        await db.execute(
            'UPDATE users SET name = ? WHERE id = ?',
            [fullName, userId]
        );

        // FIX: height_cm / weight_kg are intentionally NOT part of this
        // update anymore. They're owned by the BMI page (POST /api/bmi/:userId),
        // which upserts them into user_profiles. Touching them here would
        // overwrite that data with null every time the user saves their
        // name/contact/bio/avatar.
        await db.execute(`
            INSERT INTO user_profiles (user_id, contact, bio, avatar_url)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                contact    = VALUES(contact),
                bio        = VALUES(bio),
                avatar_url = VALUES(avatar_url)
        `, [
            userId,
            contact || null,
            bio || null,
            avatar_url || null,
        ]);

        const [saved] = await db.execute(
            'SELECT avatar_url FROM user_profiles WHERE user_id = ?',
            [userId]
        );
        console.log('avatar saved, length in db:', saved[0]?.avatar_url?.length ?? 0);

        res.json({ success: true, message: 'Profile Synchronized' });

    } catch (err) {
        console.error('profile update error:', err.code, err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/profile/:userId
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        // height_cm / weight_kg still selected here — Profile page reads
        // them read-only; they're written only from the BMI page.
        const [rows] = await db.execute(`
            SELECT 
                u.name     AS fullName,
                u.email,
                p.contact,
                p.bio,
                p.avatar_url,
                p.height_cm,
                p.weight_kg
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
        `, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('fetched profile for user:', userId);

        res.json(rows[0]);

    } catch (err) {
        console.error('profile fetch error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;