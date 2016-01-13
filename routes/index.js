var express = require('express');
var router = express.Router();
var indexService = require('../services/index');

router.get('/list', indexService.list);
router.get('/add/:name/:ticker', indexService.add);
router.get('/:index/:day', indexService.showIndexInforByNameAndDay)

module.exports = router;
