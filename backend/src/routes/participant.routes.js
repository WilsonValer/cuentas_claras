const { Router } = require('express');
const {
  updateParticipant,
  deleteParticipant,
  markParticipantPaid,
  markParticipantPending
} = require('../controllers/participant.controller');

const router = Router();

router.put('/participants/:id', updateParticipant);
router.delete('/participants/:id', deleteParticipant);
router.patch('/participants/:id/mark-paid', markParticipantPaid);
router.patch('/participants/:id/mark-pending', markParticipantPending);

module.exports = router;