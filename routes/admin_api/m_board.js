var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//커뮤니티 종류
router.get('/', async (req, res) => {
    try {
        let community;
        const sql = "select * from community";
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            community = results;
            res.status(200).json(community);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//카테고리별 글 전체조회
router.get('/:boardId', async (req, res) => {
    try {
        const param = req.params.boardId;
        const sql = "select p.*\
                       from community c\
                       join post p \
                         on c.boardId = p.boardId \
                      where p.boardId = ?";
        let notices;
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            notices = results;
            res.status(200).json(notices);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//각 커뮤니티별 글 상세조회
router.get('/one/:writId', async (req, res) => {
    try {
        // const boardId = req.params.boardId;
        // const writId = req.params.writId;
        const param = req.params.writId;
        const sql1 = "update post set writHit= writHit + 1 where writId = ?";
        const sql2 = "select p.*, f.*\
                        from post p\
                   left join file f on f.writId = p.writId\
                       where p.writId = ?";
        let notice;
        connection.query(sql1, param, (err, row) => {
            if (err) {
                console.error(err);
                res.json({
                    msg: "hit query error"
                });
            }
            connection.query(sql2, param, (err, result) => {
                if (err) {
                    console.log(err);
                    res.json({
                        msg: "select query error"
                    });
                }
                notice = result;
                res.status(200).json(notice);
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 삭제
router.delete('/:writId', async (req, res) => {
    try {
        const param = req.params.writId;
        const sql = "delete from post where writId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "success"
            })
        });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;