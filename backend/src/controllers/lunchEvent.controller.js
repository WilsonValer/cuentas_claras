const { pool } = require('../config/db');
const { getEventSummary } = require('../utils/summary');

function mapEventRow(row) {
  return {
    id: row.id,
    name: row.name,
    event_date: row.event_date,
    payer_name: row.payer_name,
    description: row.description,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    expires_at: row.expires_at,
    total_general: Number(row.total_general || 0),
    total_paid: Number(row.total_paid || 0),
    total_pending: Number(row.total_pending || 0),
    pending_people: Number(row.pending_people || 0),
    participant_count: Number(row.participant_count || 0)
  };
}

async function listLunchEvents(_req, res, next) {
  try {
    const result = await pool.query(
      `WITH participant_totals AS (
          SELECT
            p.id,
            p.lunch_event_id,
            p.payment_status,
            COALESCE(SUM(ci.price), 0)::numeric(10,2) AS total
          FROM participants p
          LEFT JOIN consumption_items ci ON ci.participant_id = p.id
          GROUP BY p.id
      )
      SELECT
        e.*,
        COALESCE(SUM(pt.total), 0)::numeric(10,2) AS total_general,
        COALESCE(SUM(CASE WHEN pt.payment_status = 'PAID' THEN pt.total ELSE 0 END), 0)::numeric(10,2) AS total_paid,
        COALESCE(SUM(CASE WHEN pt.payment_status = 'PENDING' THEN pt.total ELSE 0 END), 0)::numeric(10,2) AS total_pending,
        COALESCE(SUM(CASE WHEN pt.payment_status = 'PENDING' THEN 1 ELSE 0 END), 0)::int AS pending_people,
        COUNT(pt.id)::int AS participant_count
      FROM lunch_events e
      LEFT JOIN participant_totals pt ON pt.lunch_event_id = e.id
      GROUP BY e.id
      ORDER BY e.event_date DESC, e.id DESC`
    );

    res.json(result.rows.map(mapEventRow));
  } catch (error) {
    next(error);
  }
}

async function createLunchEvent(req, res, next) {
  try {
    const { name, event_date, payer_name, description, expires_at } = req.body;

    if (!name || !event_date || !payer_name) {
      return res.status(400).json({
        message: 'name, event_date and payer_name are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO lunch_events
       (name, event_date, payer_name, description, status, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'PENDING', COALESCE($5, ($2::date + INTERVAL '30 days')::date), NOW(), NOW())
       RETURNING *`,
      [name, event_date, payer_name, description || null, expires_at || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function getLunchEventById(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid lunch event id' });
    }

    const eventResult = await pool.query('SELECT * FROM lunch_events WHERE id = $1', [eventId]);

    if (!eventResult.rows.length) {
      return res.status(404).json({ message: 'Lunch event not found' });
    }

    const participantsResult = await pool.query(
      `SELECT
         p.*,
         COALESCE(SUM(ci.price), 0)::numeric(10,2) AS total
       FROM participants p
       LEFT JOIN consumption_items ci ON ci.participant_id = p.id
       WHERE p.lunch_event_id = $1
       GROUP BY p.id
       ORDER BY p.created_at ASC`,
      [eventId]
    );

    const participantIds = participantsResult.rows.map((row) => row.id);
    let itemsByParticipant = new Map();

    if (participantIds.length) {
      const itemsResult = await pool.query(
        `SELECT *
         FROM consumption_items
         WHERE participant_id = ANY($1::bigint[])
         ORDER BY created_at ASC`,
        [participantIds]
      );

      itemsByParticipant = itemsResult.rows.reduce((acc, item) => {
        const list = acc.get(item.participant_id) || [];
        list.push({
          ...item,
          price: Number(item.price)
        });
        acc.set(item.participant_id, list);
        return acc;
      }, new Map());
    }

    const summary = await getEventSummary(pool, eventId);

    const participants = participantsResult.rows.map((participant) => ({
      ...participant,
      total: Number(participant.total),
      items: itemsByParticipant.get(participant.id) || []
    }));

    res.json({
      ...eventResult.rows[0],
      participants,
      summary
    });
  } catch (error) {
    next(error);
  }
}

async function updateLunchEvent(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid lunch event id' });
    }

    const { name, event_date, payer_name, description, status, expires_at } = req.body;

    const result = await pool.query(
      `UPDATE lunch_events
       SET
        name = COALESCE($1, name),
        event_date = COALESCE($2, event_date),
        payer_name = COALESCE($3, payer_name),
        description = COALESCE($4, description),
        status = COALESCE($5, status),
        expires_at = COALESCE($6, expires_at),
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, event_date, payer_name, description, status, expires_at, eventId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Lunch event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteLunchEvent(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid lunch event id' });
    }

    const result = await pool.query('DELETE FROM lunch_events WHERE id = $1 RETURNING id', [eventId]);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Lunch event not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listLunchEvents,
  createLunchEvent,
  getLunchEventById,
  updateLunchEvent,
  deleteLunchEvent
};
