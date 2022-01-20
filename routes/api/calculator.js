var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//test
router.get('/:calcId', async (req, res) => {
    try {
        const sql = "select q.*, o.* from question q\
        left join calculator c on c.calcId = q.calcId\
        left join calOption o on q.qtnId = o.qtnId\
        where c.calcId = ?";
        const param = [req.params.calcId];
        let certi;
        connection.query(sql, param, (err, resutls) => {
            if (err) {
                res.json({
                    msg: "query error"
                });
            }
            certi = resutls;
            console.log(certi);
            res.status(200).json(certi);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});


module.exports = router;