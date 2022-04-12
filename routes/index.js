const express = require('express');
const router = express.Router();


const greeting = require('./api/greeting.js');
const user = require('./api/user.js')
const mypage = require('./api/mypage.js');
const notice = require('./api/notice.js');
const gallery = require('./api/gallery.js');
const refer = require('./api/refer.js');
const support = require('./api/support.js');
const comment = require('./api/comment.js');
const others = require('./api/others.js');
const board = require('./api/board.js');
const login = require('./api/login.js');
const like = require('./api/like.js');

router.use('/greeting', greeting);
router.use('/user', user);
router.use('/mypage', mypage);
router.use('/notice', notice);
router.use('/gallery', gallery);
router.use('/refer', refer);
router.use('/support', support);
router.use('/comment', comment);
router.use('/others', others);
router.use('/board', board);
router.use('/login', login);
router.use('/like', like);

module.exports = router;