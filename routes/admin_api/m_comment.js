var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//탄소실천, 챌린지 게시글 별 댓글 전체조회
router.get('/certiComment', async (req, res) => {
    try {
        const param = [req.query.certiContentId, req.query.certiContentId];
        const division = req.query.certiDivision;
        const sql = "select c.*, u.userNick, date_format(cmtDate, '%Y-%m-%d') as cmtDatefmt,\
                            (select count(*) from comment where certiContentId = ? group by certiContentId) as cmtCount\
                       from comment c\
                  left join user u on u.uid = c.uid\
                      where certiContentId = ?";
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_comment/certiCont_cmtViewForm';
            res.render(route, {
                results: results,
                division: division,
                certiContentId: req.query.certiContentId
            });
        })
    } catch (error) {
        res.send(error.message);
    }
});

//댓글 삭제
router.get('/cmtDelete', async (req, res) => {
    try {
        const sql = "delete from comment where cmtId = ?";
        connection.query(sql, req.query.cmtId, (err) => {
            if (err) {
                console.log(err);
            }
            res.redirect('certiComment?certiContentId=' + req.query.certiContentId + '&certiDivision=' + req.query.certiDivision);
        })
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;