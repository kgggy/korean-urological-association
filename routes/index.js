const express = require('express');
const router = express.Router();

const login = require('./api/login.js');
const user = require('./api/user.js')
const board = require('./api/board.js');
const certi = require('./api/certification.js');
const file = require('./api/file.js');

router.use('/login', login);
router.use('/user', user);
router.use('/board', board);
router.use('/certi', certi);
router.use('/file', file);

module.exports = router;