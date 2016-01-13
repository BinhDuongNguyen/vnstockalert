var express = require('express');
var router = express.Router();
var tickerService = require('../services/ticker');

router.get('/list', tickerService.list);

module.exports = router;