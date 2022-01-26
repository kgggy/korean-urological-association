const multer = require("multer");
const path = require('path');
const fs = require('fs');

var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

const {
    v4: uuidv4
} = require('uuid');

const uuid = () => {
    const tokens = uuidv4().split('-');
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4]
}

//파일 업로드 모듈
var upload = multer({ //multer안에 storage정보  
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            //파일이 이미지 파일이면
            if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "application/octet-stream") {
                // console.log("이미지 파일입니다.");
                callback(null, 'uploads/boardImgs');
                //텍스트 파일이면
            } else if (file.mimetype == "application/pdf" || file.mimetype == "application/txt") {
                // console.log("텍스트 파일입니다.");
                callback(null, 'uploads/boardTexts');
            }
        },
        //파일이름 설정
        filename: (req, file, done) => {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    //파일 개수, 파일사이즈 제한
    limits: {
        files: 5,
        fileSize: 1024 * 1024 * 1024 //1기가
    },

});

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

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

//각 커뮤니티별 글 전체 목록 조회
router.get('/:boardId', async (req, res) => {
    try {
        const param = req.params.boardId;
        const sql = "select p.*, f.fileRoute, f.fileNo from post p\
                  left join community c\
                         on c.boardId = p.boardId \
                  left join file f on f.writId = p.writId\
                      where p.boardId = ? and (fileNo = 0 or fileNo is null)";
        let notices;
        connection.query(sql, param, (err, results) => {
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
router.get('/one/:writId', async (req, res) => {
    try {
        // const boardId = req.params.boardId;
        // const writId = req.params.writId;
        const param = req.params.writId;
        const sql1 = "update post set writHit= writHit + 1 where writId = ?";
        const sql2 = "select p.*, f.*\
                        from post p\
                   left join file f on f.writId = p.writId\
                       where p.writId = ?";
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

//게시글 작성 및 파일첨부
router.post('/', upload.array('file'), async (req, res, next) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);

    try {
        const boardWritId = uuid();
        const param1 = [boardWritId, req.body.boardId, req.body.uid, req.body.writTitle, req.body.writContent];
        const sql1 = "insert into post(writId, boardId, uid, writTitle, writContent) values(?, ?, ?, ?, ?)";
        connection.query(sql1, param1, (err, row) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < paths.length; i++) {
                const param2 = [boardWritId, paths[i], i, orgName[i]];
                // console.log(param2);
                const sql2 = "insert into file(writId, fileRoute, fileNo, fileOrgName) values (?, ?, ?, ?)";
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    } else {
                        return;
                    }
                });

            };
        });
        return res.json({
            msg: "success"
        });
    } catch (error) {
        res.send(error.message);
    }
});

//파일 다운로드 눌렀을 때 작동
// router.get('/download/uploads/images/:name', function (req, res) {
//     var filename = req.params.name;

//     var file = __dirname + '/../uploads/images/' + filename
//     console.log(__dirname)
//     console.log(req.path)
//     console.log(file)
//     res.download(file); // Set disposition and send it.
//     });

//파일 다운로드
router.get('/download/:writId/:fileNo', async (req, res) => {
    try {
        const param = [req.params.writId, req.params.fileNo];
        const sql = "select fileRoute from file where writId = ? and fileNo = ?";
        let route;
        connection.query(sql, param, (err, result) => {
            if (err) {
                console.error(err);
                res.json({
                    msg: "query error"
                });
            }
            route = result;
            console.log(result);
            res.status(200).json(route);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});


//게시글 수정
router.post('/:writId', upload.array('file'), async (req, res) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    try {
        const sql1 = "update post set writTitle = ?, writContent = ?, writUpdDate = sysdate() where writId = ?;";
        const sql2 = "delete from file where writId = ?;"
        connection.query(sql1 + sql2, [req.body.writTitle, req.body.writContent, req.params.writId, req.params.writId], (err, row) => {
            if (err) {
                console.error(err);
                res.json({
                    msg: "query error"
                });
            }
            for (let i = 0; i < paths.length; i++) {
                const sql3 = "insert into file(writId, fileRoute, fileNo, fileOrgName) values (?, ?, ?, ?)";
                const param3 = [req.params.writId, paths[i], i, orgName[i]];
                connection.query(sql3, param3, (err) => {
                    if (err) {
                        throw err;
                    } else {
                        return;
                    }
                });

            };
            return;

        });
        return res.json({
            msg: "success"
        });
    } catch (error) {
        res.send(error.message);
    }
});

//게시글 삭제
router.delete('/:writId', async (req, res) => {
    try {
        const param = req.params.writId;
        const sql = "delete from post where writId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "success"
            })
        });
    } catch (error) {
        res.send(error.message);
    }
});



module.exports = router;