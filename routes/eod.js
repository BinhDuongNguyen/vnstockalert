var express = require('express');
var router = express.Router();
var eodService = require('../services/eod');

router.get('/list', eodService.list);
router.get('/ticker/:ticker', eodService.findByTicker);

module.exports = router;
