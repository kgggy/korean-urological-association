var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//사용자가 작성한 글 전체 조회
router.get('/all', async (req, res) => {
    try {
        const sql = "select fileRoute, c.certiContentId, p.writId, c.certiContentDate, p.writDate, f.fileNo from file f\
                  left join post p on p.writId = f.writId\
                  right join certiContent c on c.certiContentId = f.certiContentId\
                      where (p.uid = ? or c.uid = ?) and (f.fileNo = 1 or f.fileNo is null)\
                      union\
                     select fileRoute, c.certiContentId, p.writId, c.certiContentDate, p.writDate, f.fileNo from file f\
                 right join post p on p.writId = f.writId\
                  left join certiContent c on c.certiContentId = f.certiContentId\
                      where (p.uid = ? or c.uid = ?) and (f.fileNo = 1 or f.fileNo is null)\
                   order by writDate desc, certiContentDate desc;";
        const param = [req.query.uid, req.query.uid, req.query.uid, req.query.uid];
        let all;
        connection.query(sql, param, (err, resutls) => {
            if (err) {
                res.json({
                    msg: "query error"
                });
            }
            all = resutls;
            res.status(200).json(all);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//사용자의 탄소실천 글 전체 조회
router.get('/certi', async (req, res) => {
    try {
        const sql = "select f.fileRoute, c.certiContentId, c.certiTitleId, c.certiContentDate\
                       from certiContent c\
                  left join file f on f.certiContentId = c.certiContentId\
                  left join certification t on t.certiTitleId = c.certiTitleId\
                      where c.uid = ? and t.certiDivision = ? and (fileNo = 1 or fileNo is null)\
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
        const sql = "select f.fileRoute, p.writId\
                       from post p\
                  left join file f on f.writId = p.writId\
                      where p.uid = ? and p.boardId = ? and (fileNo = 1 or fileNo is null)\
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
                      where r.uid = ? and (fileNo = 1 or fileNo is null)";
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

//참여한 챌린지 목록 및 게시글 개수
router.get('/challenge/:uid', async (req, res) => {
    try {
        const param = req.params.uid;
        const sql = "select certiTitleId, count(*) as certiCount\
                       from certiContent\
                      where uid = ? group by certiTitleId";
        let certiCount;
        connection.query(sql, param, (err, resutls) => {
            if (err) {
                res.json({
                    msg: "query error"
                });
            }
            certiCount = resutls;
            res.status(200).json(certiCount);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});


module.exports = router;