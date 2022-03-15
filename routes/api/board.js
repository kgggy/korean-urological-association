var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const models = require("../../models");

const connt = require("../../config/db")

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//탄소실천, 챌린지 주제 전체 조회
router.get('/:certiDivision', async (req, res) => {
    const certiDivison = req.params.certiDivision;
    let titles = [];
    const certification = await models.certification.findAndCountAll({
        where: {
            certiDivision: certiDivison
        },
        raw: true,
    });
    for (let i = 0; i < certification.count; i++) {
        const file = await models.file.findAll({
            where: {
                certiTitleId: certification.rows[i].certiTitleId
            },
            order: [
                ['fileNo', 'asc']
            ],
            raw: true,
        });
        certification.rows[i]['fileRoute'] = file;
        titles[i] = certification.rows[i];
    }
    res.json(titles);
});

//게시판 메인
router.get('/', async (req, res) => {
    let notices;
    let gallerys;
    let refers;
    try {
        const sql = "select writDate, noticeTitle from notice order by writDate desc limit 2";
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            notices = results;
            const sql1 = "select writDate, referTitle from reference order by writDate desc limit 2";
            connection.query(sql1, (err, results) => {
                if (err) {
                    console.log(err);
                    res.json({
                        msg: "query error"
                    });
                }
                refers = results;
                const sql2 = "select galleryId, fileRoute from file where fileId in (select min(fileId) from file group by galleryId) and galleryId is not null;";
                connection.query(sql2, (err, results) => {
                    if (err) {
                        console.log(err);
                        res.json({
                            msg: "query error"
                        });
                    }
                    gallerys = results;
                    res.status(200).json([{
                        notices: notices,
                        gallerys: gallerys,
                        refers: refers
                    }]);
                });
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//날짜순 전체 종류의 탄소실천/챌린지 글
router.get('/certiContentsAll/:certiDivision', async (req, res) => {
    try {
        const param = req.params.certiDivision;
        const sql = "select f.fileRoute, c.certiContentId, c.certiContentDate\
                       from certiContent c\
                  left join file f on f.certiContentId = c.certiContentId\
                  left join certification t on t.certiTitleId = c.certiTitleId\
                      where t.certiDivision = ? and f.fileNo = 1";
        let certiContents;
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
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

module.exports = router;