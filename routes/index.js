const express = require('express');
const router = express.Router();

const login = require('./api/login.js');
const user = require('./api/user.js')
const board = require('./api/board.js');
const certification = require('./api/certification.js');
// const file = require('./api/file.js');
const comment = require('./api/comment.js');

router.use('/login', login);
router.use('/user', user);
router.use('/board', board);
router.use('/certification', certification);
// router.use('/file', file);
router.use('/comment', comment);

module.exports = router;