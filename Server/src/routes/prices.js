const express = require('express');
const router = express.Router();
const { getSnapshot, getSymbolsList, getKlines, getPriceBySymbol } = require('../controllers/pricesController');

router.get('/snapshot', getSnapshot);
router.get('/symbols/list', getSymbolsList);
router.get('/klines', getKlines);
router.get('/:symbol', getPriceBySymbol);

module.exports = router;
