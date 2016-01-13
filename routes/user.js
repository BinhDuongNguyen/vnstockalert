var express = require('express');
var router = express.Router();
var userService = require('../services/user');

router.get('/', userService.list);
router.post('/requestLogin', userService.requestLogin);
router.post('/login', userService.login);


module.exports = router;