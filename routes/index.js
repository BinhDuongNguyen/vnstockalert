var express = require('express');
var router = express.Router();
var indexService = require('../services/index');

router.get('/', indexService.list);

module.exports = router;
