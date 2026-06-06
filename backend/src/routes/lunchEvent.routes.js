const { Router } = require('express');
const {
  listLunchEvents,
  createLunchEvent,
  getLunchEventById,
  updateLunchEvent,
  deleteLunchEvent
} = require('../controllers/lunchEvent.controller');
const {
  listParticipantsByEvent,
  createParticipant
} = require('../controllers/participant.controller');

const router = Router();

router.get('/', listLunchEvents);
router.post('/', createLunchEvent);
router.get('/:id', getLunchEventById);
router.put('/:id', updateLunchEvent);
router.delete('/:id', deleteLunchEvent);

router.get('/:id/participants', listParticipantsByEvent);
router.post('/:id/participants', createParticipant);

module.exports = router;