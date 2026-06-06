async function recalculateEventStatus(client, eventId) {
  const participantsResult = await client.query(
    `SELECT payment_status FROM participants WHERE lunch_event_id = $1`,
    [eventId]
  );

  let nextStatus = 'PENDING';

  if (participantsResult.rows.length > 0) {
    const hasPending = participantsResult.rows.some((row) => row.payment_status === 'PENDING');
    nextStatus = hasPending ? 'PENDING' : 'COMPLETED';
  }

  await client.query(
    `UPDATE lunch_events
     SET status = $1, updated_at = NOW()
     WHERE id = $2`,
    [nextStatus, eventId]
  );

  return nextStatus;
}

module.exports = { recalculateEventStatus };