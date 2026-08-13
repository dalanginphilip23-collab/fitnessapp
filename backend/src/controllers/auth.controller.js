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

    // Unverified users are not considered logged in — no API/session access
    // until they confirm their email.
    if (Number(user.email_verified) !== 1) {
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

  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters." });
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must contain at least one letter and one number." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await authService.findFullUserByEmail(normalizedEmail);
    if (existing.length > 0) {
      // Account already registered. Only re-send a verification link when the
      // account is still unverified, so the "a link has been sent" message is
      // honest and never leaves the user stranded without a link.
      if (Number(existing[0].email_verified) !== 1) {
        try {
          await authService.sendEmailVerification(existing[0].id, normalizedEmail);
        } catch (mailErr) {
          console.error("Duplicate-register resend failed:", mailErr.message);
        }
      }
      return res
        .status(400)
        .json({ error: "If this email is not already registered, a verification link has been sent." });
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

    // Send the verification email and surface real success/failure. A failed
    // SMTP send no longer pretends the email went out, and the actual SMTP
    // error is returned so the deployed cause is visible instead of generic.
    let verificationEmailSent = true;
    let verificationEmailError = null;
    let verificationLink = null;
    try {
      verificationLink = await authService.sendEmailVerification(userId, normalizedEmail);
    } catch (mailErr) {
      console.error("Verification email failed to send:", mailErr.message);
      verificationEmailSent = false;
      verificationEmailError = mailErr.message;
    }

    const response = {
      success: true,
      message:
        "Account created. Please check your email to verify your account before logging in.",
      verificationEmailSent,
      verificationEmailError,
      bmi: bmiData,
    };

    // Demo/testing override: if the verification email could NOT be delivered
    // (e.g. Resend sandbox 403 without a verified domain, or any other send
    // failure), echo the verification link in the JSON response so a demo or
    // test can still verify the account. Also forceable via the
    // ALLOW_VERIFY_TOKEN_IN_RESPONSE flag. Self-disables the moment emails
    // actually go out, since verificationEmailSent becomes true.
    if (verificationLink && (!verificationEmailSent || process.env.ALLOW_VERIFY_TOKEN_IN_RESPONSE === "1")) {
      response.verificationLink = verificationLink;
    }

    res.status(201).json(response);
  } catch (err) {
    // Safety net: if two register requests for the same email land at
    // almost the same time, both can pass the findUserByEmail check
    // before either INSERT completes. The DB's UNIQUE KEY on `email`
    // then rejects the second insert with ER_DUP_ENTRY — catch that
    // specifically so the user still sees the friendly message instead
    // of a generic "Database rejection" 500.
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "If this email is not already registered, a verification link has been sent." });
    }
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
}

// ─── POST /api/auth/verify-email ───
async function verifyEmail(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Missing verification token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const expired = err.name === "TokenExpiredError";
    return res.status(400).json({
      message: expired
        ? "This verification link has expired. Please request a new one."
        : "This verification link is invalid.",
      error: expired ? "token_expired" : "invalid_token",
    });
  }

  if (decoded.purpose !== "verify-email") {
    return res.status(400).json({
      message: "This verification link is invalid.",
      error: "invalid_token",
    });
  }

  try {
    const user = await authService.findUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (Number(user.email_verified) === 1) {
      return res.json({
        success: true,
        message: "Your email is already verified. You can log in now.",
      });
    }

    await authService.markEmailVerified(user.id);

    res.json({
      success: true,
      message: "Your email has been verified. You can log in now.",
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Could not verify email." });
  }
}

// ─── POST /api/auth/resend-verification ───
async function resendVerification(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const users = await authService.findFullUserByEmail(normalizedEmail);

    if (users.length === 0) {
      return res.json({
        success: true,
        message: "If this email is registered and unverified, a verification link has been sent.",
      });
    }

    const user = users[0];

    if (Number(user.email_verified) === 1) {
      return res.json({
        success: true,
        message: "If this email is registered and unverified, a verification link has been sent.",
      });
    }

    let verificationLink = null;
    try {
      verificationLink = await authService.sendEmailVerification(user.id, normalizedEmail);
    } catch (mailErr) {
      console.error("Resend verification email failed to send:", mailErr.message);
      return res.status(500).json({
        message:
          "The verification email could not be sent right now. " + mailErr.message,
      });
    }

    const response = {
      success: true,
      message: "If this email is registered and unverified, a verification link has been sent.",
    };
    if (verificationLink && (!process.env.RESEND_FROM || process.env.ALLOW_VERIFY_TOKEN_IN_RESPONSE === "1")) {
      response.verificationLink = verificationLink;
    }

    res.json(response);
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ message: "Could not resend verification email." });
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

    if (Number(user.email_verified) !== 1) {
      return res.status(403).json({
        error: "email_not_verified",
        message: "Please verify your email before logging in.",
      });
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

      // Google already confirmed ownership of this email — treat the
      // account as verified so Google users are never blocked by the
      // email-verification gate.
      if (Number(user.email_verified) !== 1) {
        await authService.markEmailVerified(user.id);
      }
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
  verifyEmail,
  resendVerification,
  login,
  googleLogin,
  changePassword,
  logout,
};
