const multer = require("multer");
const path = require('path');
const fs = require('fs');

var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//배너 조회
router.get('/', async (req, res) => {
    try {
        const sql = "select *, date_format(startDate, '%Y-%m-%d') as startDatefmt, date_format(endDate, '%Y-%m-%d') as endDatefmt\
                       from banner\
                       where ((startDate || endDate) is null or (sysdate() between startDate and endDate)) and showYN = 0\
                       order by showNo is null asc, nullif(showNo, '') is null asc"
        connection.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            res.status(200).json(result);
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;