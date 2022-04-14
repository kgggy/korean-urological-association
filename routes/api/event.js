var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;

//행사 목록
router.get('/', async (req, res) => {
    try {
        const sql = "select *,\
                           (select choose from vote v where e.eventId = v.eventId and uid = 1) as voteyn\
                       from event e\
                   order by eventId desc"
        connection.query(sql, req.query.uid, (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            res.status(200).json(result);
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//투표하기
router.get('/vote', async (req, res) => {
    try {
        const sql = "call voteCheckUpdate(?, ?, ?)"
        const param = [req.query.uid, req.query.eventId, req.query.choose];
        connection.query(sql, param, (err) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: 'success'
            });
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//투표 명단
router.get('/voteList', async (req, res) => {
    try {
        const sql = "select u.* from vote v left join user u on u.uid = v.uid where choose = ? and eventId = ?"
        const param = [req.query.choose, req.query.eventId];
        connection.query(sql, param, (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            res.status(200).json(result);
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;