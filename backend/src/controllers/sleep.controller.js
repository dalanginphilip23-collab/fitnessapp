const sleepService = require('../services/sleep.service');

async function create(req, res) {
  const { userId } = req.params;
  const { sleep_duration, sleep_quality, recovery_score, water_intake_ml } = req.body;

  try {
    await sleepService.insertLog(userId, sleep_duration, sleep_quality, recovery_score, water_intake_ml);
    res.json({ success: true });
  } catch (err) {
    console.error('[Sleep POST] Error:', err.message);
    res.status(500).json({ error: 'Failed to load sleep data' });
  }
}

async function getToday(req, res) {
  const { userId } = req.params;
  try {
    const rows = await sleepService.getTodayLatest(userId);
    res.json(rows[0] || null);
  } catch (err) {
    console.error('[Sleep Today] Error:', err.message);
    res.status(500).json({ error: 'Failed to load sleep data' });
  }
}

async function getGraph(req, res) {
  const { userId } = req.params;
  const { range = 'D', metric = 'duration' } = req.query;
  try {
    const rows = await sleepService.getGraph(userId, range, metric);
    res.json(rows);
  } catch (err) {
    console.error('[Sleep Graph] Error:', err.message);
    res.status(500).json({ error: 'Failed to load sleep data' });
  }
}

async function getAnalysis(req, res) {
  const { userId } = req.params;
  const { range = 'D', metric = 'sleep_hours' } = req.query;
  try {
    const rows = await sleepService.getAnalysis(userId, range, metric);
    res.json(rows);
  } catch (err) {
    console.error('[Analysis Graph] Error:', err.message);
    res.status(500).json({ error: 'Failed to load sleep data' });
  }
}

async function getScatter(req, res) {
  const { userId } = req.params;
  const { timeframe = 'weekly' } = req.query;
  try {
    const rows = await sleepService.getScatter(userId, timeframe);
    res.json(rows);
  } catch (err) {
    console.error('[Scatter] Error:', err.message);
    res.status(500).json({ error: 'Failed to load sleep data' });
  }
}

module.exports = { create, getToday, getGraph, getAnalysis, getScatter };
