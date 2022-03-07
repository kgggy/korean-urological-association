const express = require('express');
const router = express.Router();

const m_user = require('./m_user.js');
const m_board = require('./m_board.js');
const m_banner = require('./m_banner.js');
const m_certification = require('./m_certification.js');
const m_certiContent = require('./m_certiContent.js');
const m_comment = require('./m_comment.js');
const m_company = require('./m_company.js');

router.use('/m_user', m_user);
router.use('/m_board', m_board);
router.use('/m_banner', m_banner);
router.use('/m_certification', m_certification);
router.use('/m_certiContent', m_certiContent);
router.use('/m_comment', m_comment);
router.use('/m_company', m_company);


module.exports = router;