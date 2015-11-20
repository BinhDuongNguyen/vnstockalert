var express = require('express');
var router = express.Router();
var signalService = require('../services/signal');

router.get('/', signalService.list);

module.exports = router;
