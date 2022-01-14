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
                response.json({
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

//각 커뮤니티별 글 전체 목록 조회
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
                response.json({
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
router.get('/:boardId/:writId', async (req, res) => {
    try {
        const boardId = req.params.boardId;
        const writId = req.params.writId;
        const sql = "select p.*\
                       from community c\
                       join post p\
                         on c.boardId = p.boardId\
                      where p.boardId = ? and p.writId = ?";
        connection.q
        let notice;
        connection.query(sql, [boardId, writId], (err, result) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            notice = result;
            res.status(200).json(notice);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//글 작성
router.post('/', async (req, res) => {
    try {
        const param = [req.body.boardId, req.body.uid, req.body.writTitle, req.body.writContent];
        const sql = "insert into post(boardId, uid, writTitle, writContent) values(?, ?, ?, ?)";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "board insert success"
            });
        });
    } catch (error) {
        res.send(error.message);
    }
});

//글 수정
router.patch('/:writId', async (req, res) => {
    try {
        const param = [req.body.writTitle, req.body.writContent, req.params.writId];
        const sql = "update post set writTitle = ?, writContent = ?, writUpdDate = sysdate() where writId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.error(err);
                response.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "board update success"
            })
        });
    } catch(error) {
        res.send(error.message);
    }
});

//글 삭제
router.delete('/:writId', async (req, res) => {
    try {
        const param = req.params.writId;
        const sql = "delete from post where writId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "board delete success"
            })
        });
    } catch (error) {
        res.send(error.message);
    }
})

//조회수 증가
router.patch('/writHit/:writId', async (req, res) => {
    try {
        const param = req.params.writId;
        const sql = "update post set writHit= writHit + 1 where writId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.error(err);
                response.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "writHit update success"
            })
        });
    } catch(error) {
        res.send(error.message);
    }
});


module.exports = router;