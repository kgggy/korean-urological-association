const express = require('express');
const router = express.Router();

const login = require('./api/login.js');
const user = require('./api/user.js')
const board = require('./api/board.js');

router.use('/login', login);
router.use('/user', user);
router.use('/board', board);

module.exports = router;