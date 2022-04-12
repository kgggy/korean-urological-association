var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;

//좋아요한 유저목록 조회
router.get('/likeUserList', async (req, res) => {
    const param = req.query.boardId;
    try {
        const sql = "select r.recommendId, r.boardId, u.userName from recommend r left join user u on r.uid = u.uid where boardId = ?";
        let likeUsers;
        connection.query(sql, param, (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            likeUsers = result;
            res.status(200).json(likeUsers);
            });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//추천
router.post('/add/board', async (req, res) => {
    try {
        const boardId = req.body.boardId;
        const uid = req.body.uid;
        const sql = "call recommendCheck(?,?)";
        connection.query(sql, boardId, uid , (err, row) => {
            if (err) {
                console.error(err);
                res.json({
                    msg: "hit query error"
                });
            }
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

module.exports = router;