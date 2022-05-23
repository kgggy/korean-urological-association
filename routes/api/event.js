var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;

//행사 목록
router.get('/', async (req, res) => {
    try {
        const sql = "call selectEvent(?, @yes, @nono, @undefine); select @yes, @nono, @undefine"
        connection.query(sql, req.query.uid, (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            res.status(200).json({event: result[0], voteCount: result[2]});
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

//투표(참석, 불참석) 명단
router.get('/voteList', async (req, res) => {
    try {
        const sql = "select u.uid, u.userName, u.userPhone1, u.userPhone2, u.userPhone3 from vote v\
                  left join user u on u.uid = v.uid where choose = ? and eventId = ? and u.uid < 10000"
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

//투표(미정자) 명단
router.get('/nVoteList', async (req, res) => {
    try {
        const nChooseSql = "select u.uid, u.userName, u.userPhone1, u.userPhone2, u.userPhone3 from user u\
                        left join (select uid from vote v where v.eventId = ?) AS B on u.uid = B.uid WHERE B.uid IS NULL and u.uid < 10000;";
        connection.query(nChooseSql, req.query.eventId, (err, results) => {
            if (err) {
                console.log(err);
            }
            res.json(results);
        })
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;