var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//탄소 실천 댓글 달기
router.post('/', async (req, res) => {
	    try {
        const param = [req.query.certiContentId, req.query.uid, req.body.cmtContent];
        const sql = "insert into comment(certiContentId, uid, cmtContent) values(?, ?, ?)";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "success"
            });
        });
    } catch (error) {
        res.send(error.message);
    }
});

//댓글 수정
router.patch('/:cmtId', async (req, res) => {
	    try {
        const param = [req.body.cmtContent, req.params.cmtId];
        const sql = "update comment set cmtContent =  ? where cmtId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "success"
            });
        });
    } catch (error) {
        res.send(error.message);
    }
});

//댓글 삭제
router.delete('/:cmtId', async (req, res) => {
	    try {
        const param = [req.params.cmtId];
        const sql = "delete from comment where cmtId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "success"
            });
        });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;