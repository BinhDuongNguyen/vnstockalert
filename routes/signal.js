var express = require('express');
var router = express.Router();
var signalService = require('../services/signal');

router.get('/list', signalService.list);
router.get('/ticker/:ticker', signalService.ticker);
router.get('/day/:day', signalService.day);
router.get('/filter/:day/:number', signalService.filter);
router.get('/filter/:index/:day/:number', signalService.filter);
router.get('/lastest', signalService.lastest);
router.get('/lastest/:index', signalService.lastestByIndex);
router.get('/displayInfo/:skip', signalService.displayInfo);
router.get('/displayInfo', signalService.displayInfo);

module.exports = router;