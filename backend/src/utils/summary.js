async function getEventSummary(client, eventId) {
  const participants = await client.query(
    `SELECT
       p.id,
       p.full_name,
       p.payment_status,
       p.payment_method,
       COALESCE(SUM(ci.price), 0)::numeric(10,2) AS total
     FROM participants p
     LEFT JOIN consumption_items ci ON ci.participant_id = p.id
     WHERE p.lunch_event_id = $1
     GROUP BY p.id
     ORDER BY p.created_at ASC`,
    [eventId]
  );

  const totals = participants.rows.reduce(
    (acc, row) => {
      const total = Number(row.total || 0);
      acc.total_general += total;
      acc.participants += 1;

      if (row.payment_status === 'PAID') {
        acc.total_paid += total;
        acc.paid_count += 1;
      } else {
        acc.total_pending += total;
        acc.pending_count += 1;
        acc.pending_people.push({
          participant_id: row.id,
          full_name: row.full_name,
          amount: total
        });
      }

      return acc;
    },
    {
      total_general: 0,
      total_paid: 0,
      total_pending: 0,
      participants: 0,
      paid_count: 0,
      pending_count: 0,
      pending_people: []
    }
  );

  return {
    ...totals,
    total_general: Number(totals.total_general.toFixed(2)),
    total_paid: Number(totals.total_paid.toFixed(2)),
    total_pending: Number(totals.total_pending.toFixed(2))
  };
}

module.exports = { getEventSummary };