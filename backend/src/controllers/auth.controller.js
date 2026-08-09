const authService = require("../services/auth.service");
const {
  bcrypt,
  jwt,
  COOKIE_NAME,
  googleClient,
  getCookieOptions,
  setSessionCookie,
  logUserSession,
} = authService;
const {
  getBmiCategory,
  calcTdee,
  insertBmiRecord,
  syncUserProfile,
} = require("../services/bmi.service");

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// ─── GET /api/auth/me ───
async function getMe(req, res) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) return res.status(200).json({ user: null });

  try {
    const user = await authService.getUserFromToken(token);

    if (!user) {
      res.clearCookie(COOKIE_NAME, getCookieOptions(req));
      return res.status(200).json({ user: null });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        goal: user.fitness_goal,
      },
    });
  } catch (err) {
    res.clearCookie(COOKIE_NAME, getCookieOptions(req));
    return res.status(200).json({ user: null });
  }
}

// ─── POST /api/auth/register ───
async function register(req, res) {
  const {
    name,
    email,
    password,
    fitness_goal,
    weight_kg,
    height_cm,
    age,
    gender,
    activity_level,
  } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await authService.findUserByEmail(normalizedEmail);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Email already registered in Vitalis labs." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);
    const result = await authService.createUser({
      name,
      email: normalizedEmail,
      hashedPw,
      fitness_goal: fitness_goal || null,
    });
    const userId = result[0].insertId;

    let bmiData = null;
    if (weight_kg && height_cm) {
      const heightM = parseFloat(height_cm) / 100;
      const bmi = parseFloat(
        (parseFloat(weight_kg) / (heightM * heightM)).toFixed(2),
      );
      const category = getBmiCategory(bmi);
      const ageNum = age ? parseInt(age, 10) : null;
      const sex = gender === "female" ? "female" : "male";
      const tdeeResult = calcTdee({
        sex,
        kg: parseFloat(weight_kg),
        cm: parseFloat(height_cm),
        age: ageNum,
        activityId: activity_level || null,
      });

      await insertBmiRecord(
        userId,
        parseFloat(weight_kg),
        parseFloat(height_cm),
        bmi,
        category,
        ageNum,
        activity_level || null,
        tdeeResult?.bmr ?? null,
        tdeeResult?.tdee ?? null,
      );

      await syncUserProfile(
        userId,
        parseFloat(height_cm),
        parseFloat(weight_kg),
      );

      bmiData = {
        bmi,
        category,
        bmr: tdeeResult?.bmr ?? null,
        tdee: tdeeResult?.tdee ?? null,
      };
    }

    res
      .status(201)
      .json({ success: true, message: "Identity created.", bmi: bmiData });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Email already registered in Vitalis labs." });
    }
    res.status(500).json({ error: "Database rejection: " + err.message });
  }
}

// ─── POST /api/auth/login ───
async function login(req, res) {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const lockStatus = authService.checkRateLimit(normalizedEmail);
  if (lockStatus) {
    return res.status(429).json({
      message: lockStatus.message,
      retryAfter: lockStatus.retryAfter,
    });
  }

  try {
    const users = await authService.findFullUserByEmail(normalizedEmail);

    if (users.length === 0) {
      authService.recordFailedAttempt(normalizedEmail);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const attempts = authService.recordFailedAttempt(normalizedEmail);

      let hint = "Invalid credentials";
      if (attempts >= 20)
        hint = "Too many failed attempts. Try again in 30 minutes.";
      else if (attempts >= 10)
        hint = "Too many failed attempts. Try again in 30 seconds.";

      return res.status(401).json({ message: hint });
    }

    authService.clearAttempts(normalizedEmail);
    await authService.setUserOnline(user.id);

    const avatarFromProfile = await authService.getLatestAvatar(user.id);
    const latestAvatar = avatarFromProfile || user.avatar_url || null;

    setSessionCookie(res, user.id, user.email, req);
    await logUserSession(req, user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: latestAvatar,
      goal: user.fitness_goal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during initialization" });
  }
}

// ─── POST /api/auth/google-login ───
async function googleLogin(req, res) {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Missing authorization code" });
  }

  try {
    // Exchange auth code for tokens
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: "postmessage",
    });

    if (!tokens.id_token) {
      return res
        .status(401)
        .json({ message: "No ID token returned from Google" });
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(401).json({ message: "Google account has no email" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const users = await authService.findFullUserByEmail(normalizedEmail);

    let user;

    if (users.length === 0) {
      // Create new user
      const salt = await bcrypt.genSalt(10);
      const randomHashedPw = await bcrypt.hash(
        Math.random().toString(36).slice(-10),
        salt,
      );
      const defaultGoal = "Unspecified (Google Auth)";

      const [insertResult] = await authService.createGoogleUser({
        name,
        email: normalizedEmail,
        hashedPw: randomHashedPw,
        fitness_goal: defaultGoal,
        picture,
      });

      user = await authService.findUserById(insertResult.insertId);
    } else {
      user = users[0];
      await authService.setUserOnline(user.id);
    }

    const avatarFromProfile = await authService.getLatestAvatar(user.id);
    const latestAvatar = avatarFromProfile || user.avatar_url || picture;

    setSessionCookie(res, user.id, user.email, req);
    await logUserSession(req, user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: latestAvatar,
      goal: user.fitness_goal,
    });
  } catch (err) {
    console.error("Google Login Error:", err.message);
    res
      .status(401)
      .json({ message: "Google authentication failed: " + err.message });
  }
}

// ─── POST /api/auth/change-password ───
async function changePassword(req, res) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Session expired — please log in again." });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters" });
  }

  try {
    const rows = await authService.getUserPasswordHash(decoded.id);
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await authService.updateUserPassword(decoded.id, newHash);

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ error: "Could not update password" });
  }
}

// ─── POST /api/auth/logout ───
async function logout(req, res) {
  const token = req.cookies?.[COOKIE_NAME];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await authService.setUserOffline(decoded.id);
    } catch (_) {}
  }

  res.clearCookie(COOKIE_NAME, getCookieOptions(req));
  res.json({ success: true, message: "User logged out." });
}

module.exports = {
  getMe,
  register,
  login,
  googleLogin,
  changePassword,
  logout,
};
