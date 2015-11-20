var express = require('express');
var router = express.Router();
var coreService = require('../services/core');

router.get('/', coreService.showHomePage);
router.get('/fetchDataFirstTime', coreService.fetchDataFromFileFirstTime);
router.get('/fetchDataDaily', coreService.fetchDataDaily);

module.exports = router;
