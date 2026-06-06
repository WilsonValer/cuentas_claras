const { pool } = require('../config/db');
const { getEventSummary } = require('../utils/summary');

async function getLunchEventSummary(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid lunch event id' });
    }

    const event = await pool.query('SELECT id FROM lunch_events WHERE id = $1', [eventId]);
    if (!event.rows.length) {
      return res.status(404).json({ message: 'Lunch event not found' });
    }

    const summary = await getEventSummary(pool, eventId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = { getLunchEventSummary };