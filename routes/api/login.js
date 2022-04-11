var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;

//이름, 전화번호로 회원 유무 검색
router.get('/', async (req, res) => {
    try {
        const sql = "select * from user";
        const param = [];
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
            }
            user = results;
            res.status(200).json(user);
        });
        console.log(user)
    } catch (error) {
        res.status(401).send(error.message);
    }
});

module.exports = router;