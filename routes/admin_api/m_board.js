var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const fs = require('fs');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//레시피
router.get('/recipe', async (req, res) => {
    fs.readFile('views/admin/board/board_list.html', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/html;charset=utf-8'
            });
            res.end(data);
        }
    });
});

//커뮤니티 종류
router.get('/', async (req, res) => {
    try {
        let community;
        const sql = "select * from community";
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            community = results;
            res.status(200).json(community);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//카테고리별 글 전체조회
router.get('/all', async (req, res) => {
    try {
        const param = req.query.boardId;
        const sql = "select p.*, u.userNick, date_format(writDate, '%Y-%m-%d') as writDatefmt, date_format(writUpdDate, '%Y-%m-%d') as writUpdDatefmt\
                       from post p\
                  left join community c\
                         on c.boardId = p.boardId\
                  left join user u\
                         on u.uid = p.uid\
                      where p.boardId = ?";
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            let route = req.app.get('views') + '/recipe';
            console.log(route);
            res.render(route, {
                'results': results
            });
            console.log(results);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//각 커뮤니티별 글 상세조회
router.get('/selectOne', async (req, res) => {
    try {
        const param = req.query.writId;
        const sql = "select p.*, f.fileRoute, u.userNick, date_format(writDate, '%Y-%m-%d') as writDatefmt, date_format(writUpdDate, '%Y-%m-%d') as writUpdDatefmt\
                        from post p\
                   left join file f on f.writId = p.writId\
                   left join user u on u.uid = p.uid\
                       where p.writId = ?";

        connection.query(sql, param, (err, result) => {
            if (err) {
                res.json({
                    msg: "select query error"
                });
            }
            let route = req.app.get('views') + '/brd_viewForm';
            res.render(route, {
                'result': result,
                layout: false
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 삭제
router.get('/brdDelete', async (req, res) => {
    try {
        const param = req.query.writId;
        const sql = "delete from post where writId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            res.send("<script>opener.parent.location.reload(); window.close();</script>");
        });
    } catch (error) {
        res.send(error.message);
    }
});

//게시글 수정 폼 이동
router.get('/brdUdtForm', async (req, res) => {
    try {
        const param = req.query.writId;
        const sql = "select p.*, f.fileRoute, u.userNick, date_format(writDate, '%Y-%m-%d') as writDatefmt, date_format(writUpdDate, '%Y-%m-%d') as writUpdDatefmt\
                       from post p\
                  left join file f on f.writId = p.writId\
                  left join user u on u.uid = p.uid\
                      where p.writId = ?";
        connection.query(sql, param, function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/brd_udtForm';
            console.log(route);
            res.render(route, {
                'result': result,
                layout: false
            });
            console.log(result);
        });

    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 수정
router.post('/brdUpdate', async (req, res) => {
    try {
        const param = [req.body.writTitle, req.body.writContent, req.body.writId];
        console.log("=============" + param);
        const sql1 = "update post set writTitle = ?, writContent = ?, writUpdDate = sysdate() where writId = ?;";
        connection.query(sql1, param, (err, row) => {
            if (err) {
                console.error(err);
                res.json({
                    msg: "query error"
                });
            }
            res.redirect('selectOne?writId=' + req.body.writId);
        });
    } catch (error) {
        res.send(error.message);
    }
});


module.exports = router;