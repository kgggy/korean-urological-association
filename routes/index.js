const express = require('express');
const router = express.Router();

const login = require('./api/login.js');
const user = require('./api/user.js')
const board = require('./api/board.js');
const certification = require('./api/certification.js');
// const file = require('./api/file.js');
const comment = require('./api/comment.js');
const mypage = require('./api/mypage.js');
const recommend = require('./api/recommend.js');
const calculator = require('./api/calculator.js');
const m_user = require('./admin_api/m_user.js');
const m_board = require('./admin_api/m_board.js');
const m_banner = require('./admin_api/m_banner.js');


router.use('/login', login);
router.use('/user', user);
router.use('/board', board);
router.use('/certification', certification);
// router.use('/file', file);
router.use('/comment', comment);
router.use('/mypage', mypage);
router.use('/recommend', recommend);
router.use('/calculator', calculator);
router.use('/user', m_user);
router.use('/m_board', m_board);
router.use('/m_banner', m_banner);


module.exports = router;