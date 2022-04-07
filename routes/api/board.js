var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;

//게시판 메인
router.get('/', async (req, res) => {
    let notices;
    let gallerys;
    let refers;
    try {
        const sql = "select noticeWritDate, noticeTitle from notice order by noticeWritDate desc limit 2";
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            notices = results;
            const sql1 = "select referWritDate, referTitle from reference order by referWritDate desc limit 2";
            connection.query(sql1, (err, results) => {
                if (err) {
                    console.log(err);
                    res.json({
                        msg: "query error"
                    });
                }
                refers = results;
                const sql2 = "select boardId, fileRoute from file where left(boardId, 1) = 'g' order by fileId desc limit 15;";
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

module.exports = router;