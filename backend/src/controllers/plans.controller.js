const plansService = require('../services/plans.service');

async function enroll(req, res) {
  const { planId } = req.body;
  const userId = req.user.id;

  if (!planId) {
    return res.status(400).json({ error: "planId is required" });
  }

  try {
    await plansService.enroll(userId, planId);
    res.json({ success: true, message: "Blueprint added to your library" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "You already own this blueprint" });
    console.error("Enrollment Error:", err);
    res.status(500).json({ error: "Transaction failed" });
  }
}

async function completeDay(req, res) {
  const { planId, dayNumber } = req.body;
  const userId = req.user.id;

  if (!planId || !dayNumber) {
    return res.status(400).json({ error: "planId and dayNumber are required" });
  }

  try {
    await plansService.completeDay(userId, planId, dayNumber);
    res.json({ success: true });
  } catch (err) {
    console.error("Complete Day Error:", err);
    res.status(500).json({ error: "Could not save progress" });
  }
}

async function getProgress(req, res) {
  const { userId, planId } = req.params;
  try {
    const rows = await plansService.getProgress(userId, planId);
    res.json(rows);
  } catch (err) {
    console.error("Progress Fetch Error:", err);
    res.status(500).json({ error: "Could not fetch progress" });
  }
}

async function getContent(req, res) {
  const { planId } = req.params;
  try {
    const result = await plansService.getPlanContent(planId);
    res.json(result);
  } catch (err) {
    console.error("Plan Content Error:", err);
    res.status(500).json({ error: "Failed to load plan schedule" });
  }
}

async function getMarketplace(req, res) {
  const { userId } = req.params;
  try {
    const rows = await plansService.getMarketplace(userId);
    res.json(rows);
  } catch (err) {
    console.error("Marketplace Fetch Error:", err);
    res.status(500).json({ error: "Failed to load blueprints" });
  }
}

module.exports = { enroll, completeDay, getProgress, getContent, getMarketplace };
