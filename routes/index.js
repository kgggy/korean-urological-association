const express = require('express');
const router = express.Router();

const login = require('./api/login.js');
const user = require('./api/user.js')

router.use('/login', login);
router.use('/user', user);

module.exports = router;