var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//탄소실천, 챌린지 게시글 별 댓글 전체조회
router.get('/:certiContentId', async (req, res) => {
    try {
        const param = [req.params.certiContentId];
        const sql = "select * from comment where certiContentId = ?";
        let comment;
        connection.query(sql, param, (err, results) => {
            if(err) {
                res.json({
                    msg: "query error"
                });
            }
            comment = results;
            res.json(comment);
        })
    } catch(error) {
        res.send(error.message);
    }
});

//레시피 게시글 별 댓글 전체조회
router.get('/:writId', async (req, res) => {
    try {
        const param = [req.params.certiContentId];
        const sql = "select * from comment where writId = ?";
        let comment;
        connection.query(sql, param, (err, results) => {
            if(err) {
                res.json({
                    msg: "query error"
                });
            }
            comment = results;
            res.json(comment);
        })
    } catch(error) {
        res.send(error.message);
    }
});

//탄소실천, 챌린지 게시글의 댓글 달기
router.post('/', async (req, res) => {
	    try {
        const param = [req.query.certiContentId, req.query.uid, req.body.cmtContent];
        const sql = "insert into comment(certiContentId, uid, cmtContent) values(?, ?, ?)";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                res.json({
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

//레시피 게시글의 댓글 달기
router.post('/', async (req, res) => {
    try {
    const param = [req.query.writId, req.query.uid, req.body.cmtContent];
    const sql = "insert into comment(writId, uid, cmtContent) values(?, ?, ?)";
    connection.query(sql, param, (err, row) => {
        if (err) {
            console.log(err);
            res.json({
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
        const sql = "update comment set cmtContent =  ?, cmtUpdDate = sysdate() where cmtId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                res.json({
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
                res.json({
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