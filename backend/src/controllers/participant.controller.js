const { pool } = require('../config/db');
const { recalculateEventStatus } = require('../utils/eventStatus');

async function listParticipantsByEvent(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid lunch event id' });
    }

    const result = await pool.query(
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

    res.json(
      result.rows.map((row) => ({
        ...row,
        total: Number(row.total)
      }))
    );
  } catch (error) {
    next(error);
  }
}

async function createParticipant(req, res, next) {
  const client = await pool.connect();

  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid lunch event id' });
    }

    const { full_name } = req.body;
    if (!full_name) {
      return res.status(400).json({ message: 'full_name is required' });
    }

    await client.query('BEGIN');

    const eventExists = await client.query('SELECT id FROM lunch_events WHERE id = $1', [eventId]);
    if (!eventExists.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Lunch event not found' });
    }

    const result = await client.query(
      `INSERT INTO participants
       (lunch_event_id, full_name, payment_status, created_at, updated_at)
       VALUES ($1, $2, 'PENDING', NOW(), NOW())
       RETURNING *`,
      [eventId, full_name]
    );

    await recalculateEventStatus(client, eventId);
    await client.query('COMMIT');

    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

async function updateParticipant(req, res, next) {
  const client = await pool.connect();

  try {
    const participantId = Number(req.params.id);
    if (Number.isNaN(participantId)) {
      return res.status(400).json({ message: 'Invalid participant id' });
    }

    const { full_name, payment_status, payment_method } = req.body;

    await client.query('BEGIN');

    const current = await client.query('SELECT * FROM participants WHERE id = $1', [participantId]);
    if (!current.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Participant not found' });
    }

    const nextPaymentStatus = payment_status || current.rows[0].payment_status;
    const nextPaymentMethod =
      nextPaymentStatus === 'PAID'
        ? (payment_method ?? current.rows[0].payment_method)
        : null;

    const result = await client.query(
      `UPDATE participants
       SET
        full_name = COALESCE($1, full_name),
        payment_status = $2,
        payment_method = $3,
        paid_at = CASE WHEN $2 = 'PAID' THEN NOW() ELSE NULL END,
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [full_name, nextPaymentStatus, nextPaymentMethod, participantId]
    );

    await recalculateEventStatus(client, current.rows[0].lunch_event_id);
    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

async function deleteParticipant(req, res, next) {
  const client = await pool.connect();

  try {
    const participantId = Number(req.params.id);
    if (Number.isNaN(participantId)) {
      return res.status(400).json({ message: 'Invalid participant id' });
    }

    await client.query('BEGIN');

    const current = await client.query(
      'DELETE FROM participants WHERE id = $1 RETURNING id, lunch_event_id',
      [participantId]
    );

    if (!current.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Participant not found' });
    }

    await recalculateEventStatus(client, current.rows[0].lunch_event_id);
    await client.query('COMMIT');

    res.status(204).send();
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

async function markParticipantPaid(req, res, next) {
  const client = await pool.connect();

  try {
    const participantId = Number(req.params.id);
    if (Number.isNaN(participantId)) {
      return res.status(400).json({ message: 'Invalid participant id' });
    }

    const { payment_method } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE participants
       SET
        payment_status = 'PAID',
        payment_method = COALESCE($1, payment_method),
        paid_at = NOW(),
        updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [payment_method || null, participantId]
    );

    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Participant not found' });
    }

    await recalculateEventStatus(client, result.rows[0].lunch_event_id);
    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

async function markParticipantPending(req, res, next) {
  const client = await pool.connect();

  try {
    const participantId = Number(req.params.id);
    if (Number.isNaN(participantId)) {
      return res.status(400).json({ message: 'Invalid participant id' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE participants
       SET
        payment_status = 'PENDING',
        payment_method = NULL,
        paid_at = NULL,
        updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [participantId]
    );

    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Participant not found' });
    }

    await recalculateEventStatus(client, result.rows[0].lunch_event_id);
    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  listParticipantsByEvent,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  markParticipantPaid,
  markParticipantPending
};
