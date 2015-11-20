var express = require('express');
var router = express.Router();
var eodService = require('../services/eod');

router.get('/', eodService.list);

module.exports = router;
