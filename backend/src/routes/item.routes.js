const { Router } = require('express');
const {
  listItemsByParticipant,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/item.controller');

const router = Router();

router.get('/participants/:id/items', listItemsByParticipant);
router.post('/participants/:id/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

module.exports = router;