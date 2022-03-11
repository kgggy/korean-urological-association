var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const fs = require('fs');

const multer = require("multer");
const path = require('path');


const connt = require("../../config/db")

const {
    v4: uuidv4
} = require('uuid');

const uuid = () => {
    const tokens = uuidv4().split('-');
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4]
}

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//파일업로드 모듈
var upload = multer({ //multer안에 storage정보  
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            //파일이 이미지 파일이면
            if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "application/octet-stream") {
                // console.log("이미지 파일입니다.");
                callback(null, 'uploads/boardImgs');
                //텍스트 파일이면
            } else {
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

//카테고리별 글 전체조회
router.get('/all', async (req, res) => {
    try {
        //카테고리 명 조회
        const param = req.query.boardId;
        const sql1 = "select * from community where boardId = ?";
        let community = "";
        connection.query(sql1, param, (err, results) => {
            if (err) {
                console.log(err);
            }
            community = results;
        });
        //게시판별 글 전체조회
        var page = req.query.page;
        var searchType = req.query.searchType == undefined ? "" : req.query.searchType;
        var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
        var keepSearch = "&searchType=" + searchType + "&searchText=" + searchText;
        var sql = "select p.*, c.*, u.userNick, m.comNick, u.uid, date_format(writDate, '%Y-%m-%d') as writDatefmt, date_format(writUpdDate, '%Y-%m-%d') as writUpdDatefmt\
                       from post p\
                  left join community c on c.boardId = p.boardId\
                  left join user u  on u.uid = p.uid\
                  left join company m on m.comId = p.comId\
                      where p.boardId = ?";
        if (searchType != '' && searchText != '') {
            sql += " and " + searchType + " like '%" + searchText + "%'";
        }
        sql += " order by p.writRank is null asc, nullif(p.writRank, '') is null asc, p.writRank, p.writDate desc";
        connection.query(sql, param, (err, results) => {
            var last = Math.ceil((results.length) / 15);
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_board/board';
            res.render(route, {
                community: community,
                searchType: searchType,
                searchText: searchText,
                results: results,
                page: page,
                length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
                page_num: 15, //한 페이지에 보여줄 개수
                pass: true,
                last: last,
                keepSearch: keepSearch
            });
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//각 커뮤니티별 글 상세조회
router.get('/selectOne', async (req, res) => {
    try {
        const param = req.query.writId;
        const sql = "select p.*, c.comNick, f.fileRoute, f.fileOrgName, f.fileNo, u.userNick, date_format(writDate, '%Y-%m-%d') as writDatefmt, date_format(writUpdDate, '%Y-%m-%d') as writUpdDatefmt\
                        from post p\
                   left join file f on f.writId = p.writId\
                   left join user u on u.uid = p.uid\
                   left join company c on c.comId = p.comId\
                       where p.writId = ?";

        connection.query(sql, param, (err, result) => {
            if (err) {
                res.json({
                    msg: "select query error"
                });
            }
            let route = req.app.get('views') + '/m_board/brd_viewForm';
            res.render(route, {
                'result': result
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 등록 폼 이동
router.get('/writForm', async (req, res) => {
    console.log(req.query.uid)
    console.log(req.query.boardId)
    let route = req.app.get('views') + '/m_board/brd_writForm.ejs';
    res.render(route, {
        uid: req.query.uid,
        boardId: req.query.boardId
    });
});

//게시글 작성 및 파일첨부
router.post('/boardwrite', upload.array('file'), async (req, res, next) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    // console.log(req.body);
    // console.log(req.files);
    const sessionId = req.session.user.comId;
    try {
        const boardWritId = uuid();
        // req.body.writRank = parseInt(req.body.writRank);
        const param1 = [boardWritId, req.body.boardId, sessionId, req.body.writTitle, req.body.writContent, req.body.writRank, req.body.writRank];
        const sql1 = "insert into post(writId, boardId, comId, writTitle, writContent, writRank) values(?, ?, ?, ?, ?, if(trim(?)='', null, ?))";
        connection.query(sql1, param1, (err) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < paths.length; i++) {
                const param2 = [boardWritId, paths[i], i + 1, orgName[i]];
                // console.log(param2);
                const sql2 = "insert into file(writId, fileRoute, fileNo, fileOrgName) values (?, ?, ?, ?)";
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            };
        });
        res.send('<script>alert("게시글이 등록되었습니다."); location.href="/admin/m_board/all?boardId=' + req.body.boardId + '&page=1";</script>');
    } catch (error) {
        res.send(error.message);
    }
});

//게시글 수정 폼 이동
router.get('/brdUdtForm', async (req, res) => {
    try {
        const param = req.query.writId;
        const sql = "select p.*, f.fileRoute, f.fileOrgName, f.fileNo, u.userNick, date_format(writDate, '%Y-%m-%d') as writDatefmt, date_format(writUpdDate, '%Y-%m-%d') as writUpdDatefmt\
                       from post p\
                  left join file f on f.writId = p.writId\
                  left join user u on u.uid = p.uid\
                      where p.writId = ?";
        connection.query(sql, param, function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_board/brd_udtForm';
            console.log(route);
            res.render(route, {
                'result': result
            });
            console.log(result);
        });

    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 수정
router.post('/brdUpdate', upload.array('file'), (req, res) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    // console.log(paths);
    try {
        const param = [req.body.writTitle, req.body.writContent, req.body.writRank, req.body.writRank, req.body.writId];
        const sql1 = "update post set writTitle = ?, writContent = ?, writUpdDate = sysdate(), writRank = if(trim(?)='', null, ?) where writId = ?";
        connection.query(sql1, param, (err, row) => {
            if (err) {
                console.error(err);
            }
            for (let i = 0; i < paths.length; i++) {
                const sql2 = "insert into file(writId, fileRoute, fileOrgName) values (?, ?, ?)";
                const param2 = [req.body.writId, paths[i], orgName[i]];
                // console.log(param2);
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    }
                    const sql3 = "SELECT @fileNo:=0;\
                                      UPDATE file SET fileNo=@fileNo:=@fileNo+1 where writId = ?;";
                    const param3 = [req.body.writId];
                    connection.query(sql3, param3, (err) => {
                        if (err) {
                            throw err;
                        }
                        // console.log("fileNo update success");
                    });

                });
            };
            res.redirect('selectOne?writId=' + req.body.writId);
        });
    } catch (error) {
        res.send(error.message);
    }
});

//첨부파일 삭제
router.get('/fileDelete', async (req, res) => {
    const param = [req.query.writId, req.query.fileNo];
    const fileRoute = req.query.fileRoute;
    try {
        const sql = "delete from file where writId = ? and fileNo = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err)
            }
            fs.unlinkSync(fileRoute.toString(), (err) => {
                if (err) {
                    console.log(err);
                }
                return;
            });
        })
    } catch (error) {
        if (error.code == "ENOENT") {
            console.log("프로필 삭제 에러 발생");
        }
    }
    res.redirect('brdUdtForm?writId=' + req.query.writId);
});

//게시글 삭제
router.get('/brdDelete', async (req, res) => {
    try {
        const param = req.query.writId;
        const boardId = req.query.boardId;
        // console.log(param);
        const sql = "delete from post where writId = ?";
        connection.query(sql, param, (err) => {
            if (err) {
                console.log(err);
            }
            if (req.query.fileRoute != undefined) {
                console.log(req.query.fileRoute);
                if (Array.isArray(req.query.fileRoute) == false) {
                    req.query.fileRoute = [req.query.fileRoute];
                }
                for (let i = 0; i < req.query.fileRoute.length; i++) {
                    fs.unlinkSync(req.query.fileRoute[i], (err) => {
                        if (err) {
                            console.log(err);
                        }
                        return;
                    });
                }
            }
            res.send('<script>alert("게시글이 삭제되었습니다."); location.href="/admin/m_board/all?boardId=' + boardId + '&page=1";</script>');
        });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;