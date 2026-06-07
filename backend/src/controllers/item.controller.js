const { pool } = require('../config/db');

async function listItemsByParticipant(req, res, next) {
  try {
    const participantId = Number(req.params.id);
    if (Number.isNaN(participantId)) {
      return res.status(400).json({ message: 'Invalid participant id' });
    }

    const result = await pool.query(
      `SELECT *
       FROM consumption_items
       WHERE participant_id = $1
       ORDER BY created_at ASC`,
      [participantId]
    );

    res.json(
      result.rows.map((row) => ({
        ...row,
        price: Number(row.price)
      }))
    );
  } catch (error) {
    next(error);
  }
}

async function createItem(req, res, next) {
  try {
    const participantId = Number(req.params.id);
    if (Number.isNaN(participantId)) {
      return res.status(400).json({ message: 'Invalid participant id' });
    }

    const { description, price } = req.body;

    if (!description || price === undefined) {
      return res.status(400).json({ message: 'description and price are required' });
    }

    const result = await pool.query(
      `INSERT INTO consumption_items
       (participant_id, description, price, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [participantId, description, price]
    );

    res.status(201).json({
      ...result.rows[0],
      price: Number(result.rows[0].price)
    });
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const itemId = Number(req.params.id);
    if (Number.isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const { description, price } = req.body;

    const result = await pool.query(
      `UPDATE consumption_items
       SET
        description = COALESCE($1, description),
        price = COALESCE($2, price),
        updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [description, price, itemId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      ...result.rows[0],
      price: Number(result.rows[0].price)
    });
  } catch (error) {
    next(error);
  }
}

async function deleteItem(req, res, next) {
  try {
    const itemId = Number(req.params.id);
    if (Number.isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const result = await pool.query('DELETE FROM consumption_items WHERE id = $1 RETURNING id', [itemId]);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listItemsByParticipant,
  createItem,
  updateItem,
  deleteItem
};
