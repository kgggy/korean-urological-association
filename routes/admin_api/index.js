const express = require('express');
const router = express.Router();

const m_user = require('./m_user.js'); 
const m_board = require('./m_board.js');
const m_banner = require('./m_banner.js');
const m_certification = require('./m_certification.js');

router.use('/m_user', m_user);
router.use('/m_board', m_board);
router.use('/m_banner', m_banner);
router.use('/m_certification', m_certification);


module.exports = router;