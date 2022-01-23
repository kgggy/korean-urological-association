const express = require('express');
const router = express.Router();

const m_user = require('./m_user.js'); 
const m_board = require('./m_board.js');
const m_banner = require('./m_banner.js');

router.use('/memberList', m_user);
router.use('/m_board', m_board);
router.use('/m_banner', m_banner);


module.exports = router;