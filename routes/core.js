var express = require('express');
var router = express.Router();
var coreService = require('../services/core');

router.get('/', coreService.showHomePage);
router.get('/fetchDataFirstTime', coreService.fetchDataFromFileFirstTime);
router.get('/fetchDataDaily', coreService.fetchDataDaily);
router.get('/processSignalFirstTime', coreService.processSignalFirstTime);
router.get('/processTickerFirstTime', coreService.processTickerFirstTime);
// router.get('/caculateSignal/:Ticker', coreService.caculateSignal);

module.exports = router;