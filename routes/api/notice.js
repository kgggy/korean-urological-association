var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;

//공지사항 글 전체 목록 조회
router.get('/', async (req, res) => {
    try {
        const sql = "select * from notice order by noticeFix desc, noticeWritDate desc";
        let notices;
        connection.query(sql, (err, results) => {
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
router.get('/one/:noticeId', async (req, res) => {
    try {
        const param = req.params.noticeId;
        const sql1 = "update notice set noticeHit= noticeHit + 1 where noticeId = ?";
        const sql2 = "select *\
                        from notice n\
                   left join file f on f.boardId = n.noticeId\
                       where n.noticeId = ?";
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

//파일 다운로드
// router.get('/download/:noticeId/:fileNo', async (req, res) => {
//     try {
//         const param = [req.params.noticeId, req.params.fileId];
//         const sql = "select fileRoute from file where noticeId = ? and fileId = ?";
//         let route;
//         connection.query(sql, param, (err, result) => {
//             if (err) {
//                 console.error(err);
//                 res.json({
//                     msg: "query error"
//                 });
//             }
//             route = result;
//             console.log(result);
//             res.status(200).json(route);
//         });
//     } catch (error) {
//         res.status(401).send(error.message);
//     }
// });

module.exports = router;