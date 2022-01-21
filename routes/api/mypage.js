var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//사용자의 탄소실천 글 전체 조회
router.get('/certi', async (req, res) => {
    try {
        const sql = "select f.fileRoute\
                       from certiContent c\
                  left join file f on f.certiContentId = c.certiContentId\
                  left join certification t on t.certiTitleId = c.certiTitleId\
                      where c.uid = ? and t.certiDivision = ? and f.fileNo = 0\
                   order by c.certiContentDate desc";
        const param = [req.query.uid, req.query.certiDivision];
        let certi;
        connection.query(sql, param, (err, resutls) => {
            if (err) {
                res.json({
                    msg: "query error"
                });
            }
            certi = resutls;
            res.status(200).json(certi);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//사용자의 레시피 글 전체 조회
router.get('/recipe', async (req, res) => {
    try {
        const sql = "select f.fileRoute\
                       from post p\
                  left join file f on f.writId = p.writId\
                      where p.uid = 1 and p.boardId = ? and f.fileNo = 0\
                   order by p.writDate desc";
        const param = [req.query.uid, req.query.boardId];
        let certi;
        connection.query(sql, param, (err, resutls) => {
            if (err) {
                res.json({
                    msg: "query error"
                });
            }
            certi = resutls;
            res.status(200).json(certi);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//내가 좋아요한 글
router.get('/likes', async (req, res) => {
    try {
        const sql = "select distinct f.*\
                       from recommend r\
                  left join post p on p.writId = r.writId\
                  left join certiContent c on c.certiContentId = r.certiContentId\
                  left join file f on f.certiContentId = r.certiContentID or f.writId = r.writId\
                      where r.uid = ? and f.fileNo = 0";
        const param = [req.query.uid, req.query.boardId];
        let certi;
        connection.query(sql, param, (err, resutls) => {
            if (err) {
                res.json({
                    msg: "query error"
                });
            }
            certi = resutls;
            res.status(200).json(certi);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});


module.exports = router;