var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//탄소실천, 챌린지 주제 전체 조회
router.get('/:certiDivision', async (req, res) => {
    try {
        const param = req.params.certiDivision;
        const sql = "select * from certification where certiDivision = ?";
        let certifications;
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            certifications = results;
            res.status(200).json(certifications);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천, 챌린지 주제별 전체 썸네일 조회
router.get('/certiContents/:certiTitleId', async (req, res) => {
    try {
        const param = req.params.certiTitleId;
        const sql = "select f.fileRoute, c.certiContentId\
                       from file f \
                       join certiContent c\
                         on f.certiContentId = c.certiContentId\
                      where c.certiTitleId = ? and f.fileNo = 0";
        let certiContents;
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            certiContents = results;
            res.status(200).json(certiContents);
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
                response.json({
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