var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;

//공지사항 글 전체 목록 조회
router.get('/', async (req, res) => {
    try {
        const sql = "select * from file group by boardId;";
        let gallerys;
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            gallerys = results;
            res.status(200).json(gallerys);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//각 커뮤니티별 글 상세조회
router.get('/one/:galleryId', async (req, res) => {
    try {
        const param = req.params.galleryId;
        const sql1 = "update gallery set galleryHit= galleryHit + 1 where galleryId = ?";
        const sql2 = "select *\
                        from gallery n\
                   left join file f on f.boardId = n.galleryId\
                       where n.galleryId = ?";
        let gallery;
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
                gallery = result;
                res.status(200).json(gallery);
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//파일 다운로드
// router.get('/download/:galleryId/:fileNo', async (req, res) => {
//     try {
//         const param = [req.params.galleryId, req.params.fileId];
//         const sql = "select fileRoute from file where galleryId = ? and fileId = ?";
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