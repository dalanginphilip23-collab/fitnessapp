const sleepService = require('../services/sleep.service');
const logger = require('../utils/logger');

async function create(req, res) {
  const { userId } = req.params;
  const { sleep_duration, sleep_quality, recovery_score, water_intake_ml } = req.body;

  try {
    await sleepService.insertLog(userId, sleep_duration, sleep_quality, recovery_score, water_intake_ml);
    res.json({ success: true });
  } catch (err) {
    logger.error('[Sleep POST] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getToday(req, res) {
  const { userId } = req.params;
  try {
    const rows = await sleepService.getTodayLatest(userId);
    res.json(rows[0] || null);
  } catch (err) {
    logger.error('[Sleep Today] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getGraph(req, res) {
  const { userId } = req.params;
  const { range = 'D', metric = 'duration' } = req.query;
  try {
    const rows = await sleepService.getGraph(userId, range, metric);
    res.json(rows);
  } catch (err) {
    logger.error('[Sleep Graph] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getAnalysis(req, res) {
  const { userId } = req.params;
  const { range = 'D', metric = 'sleep_hours' } = req.query;
  try {
    const rows = await sleepService.getAnalysis(userId, range, metric);
    res.json(rows);
  } catch (err) {
    logger.error('[Analysis Graph] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getScatter(req, res) {
  const { userId } = req.params;
  const { timeframe = 'weekly' } = req.query;
  try {
    const rows = await sleepService.getScatter(userId, timeframe);
    res.json(rows);
  } catch (err) {
    logger.error('[Scatter] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { create, getToday, getGraph, getAnalysis, getScatter };
