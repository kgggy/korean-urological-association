var express = require('express');
var router = express.Router();
const models = require("../../models");
var connection = require('../../config/db').conn;

//게시판 메인
router.get('/', async (req, res) => {
    let notices;
    let gallerys;
    let refers;
    // let gallery = await models.gallery.findAndCountAll({
    //     attributes: ["galleryId"],
    //     group: "galleryId",
    //     raw: true
    // });
    // console.log(gallery.count.length)
    try {
        const sql = "select noticeWritDate, noticeTitle from notice order by noticeFix desc, noticeWritDate desc limit 2";
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
                // for (let i = 0; i < gallery.count.length; i++) {
                const sql2 = "select * from file group by boardId; ";
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
                // }
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

module.exports = router;