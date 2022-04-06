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
//var connection = mysql.createConnection(connt);
//connection.connect();                    
var connection = require('../../config/db').conn;

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

//공지사항 글 전체조회
router.get('/notice', async (req, res) => {
    try {
        var page = req.query.page;
        var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
        var keepSearch = "&searchText=" + searchText;
        var sql = "select *,  date_format(noticeWritDate, '%Y-%m-%d') as noticeWritDateFmt\
                       from notice";
        if (searchText != '') {
            sql += "where noticeTitle like '%"+searchText+"%' or noticeContent like '%"+searchText+"%'";
        }
        sql += " order by 1 desc";
        connection.query(sql, (err, results) => {
            var last = Math.ceil((results.length) / 15);
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_notice/notice';
            res.render(route, {
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

//게시글 검색(ajax)
router.get('/noticeSearch', async (req, res) => {
    var page = req.query.page;
    var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
    var keepSearch = "&searchText=" + searchText;
    var sql = "select *,  date_format(noticeWritDate, '%Y-%m-%d') as noticeWritDateFmt from notice";
    if (searchText != '') {
        sql += " where noticeTitle like '%" + searchText + "%' or noticeContent like '%" + searchText + "%'";
    }
    sql += " order by 1 desc";
    connection.query(sql, (err, results) => {
        if (err) {
            console.log(err)
        }
         console.log("searchText = " + searchText)
         console.log("results = " + results)
        var last = Math.ceil((results.length) / 10);
        // ajaxSearch = results;
        res.send({
            ajaxSearch: results,
            page: page,
            length: results.length - 1,
            page_num: 10,
            pass: true,
            last: last,
            searchText: searchText
        });
        console.log("ajaxSearch = " + results.length);
        // console.log("page = " + page)
    });
});

//공지사항 글 상세조회
router.get('/selectOne', async (req, res) => {
    try {
        const param = req.query.noticeId;
        const sql = "select *,date_format(noticeWritDate, '%Y-%m-%d') as noticeWritDateFmt\
                        from notice\
                       where notice = ?";

        connection.query(sql, param, (err, result) => {
            if (err) {
                res.json({
                    msg: "select query error"
                });
            }
            let route = req.app.get('views') + '/m_notice/notice_viewForm';
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
    console.log(req.query.noticeId)
    let route = req.app.get('views') + '/m_notice/notice_writForm.ejs';
    res.render(route, {
        uid: req.query.uid,
        noticeId: req.query.noticeId
    });
});

//게시글 작성 및 파일첨부
router.post('/noticewrite', upload.array('file'), async (req, res, next) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    // console.log(paths);
    const sessionId = req.session.user.comId;
    try {
        const noticeWritId = uuid();
        // req.body.writRank = parseInt(req.body.writRank);
        const param1 = [noticeWritId, req.body.noticeId, sessionId, req.body.writTitle, req.body.writContent, req.body.writRank, req.body.writRank];
        const sql1 = "insert into post(writId, noticeId, comId, writTitle, writContent, writRank) values(?, ?, ?, ?, ?, if(trim(?)='', null, ?))";
        connection.query(sql1, param1, (err) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < paths.length; i++) {
                const param2 = [noticeWritId, paths[i], i + 1, orgName[i], path.extname(paths[i])];
                // console.log(param2);
                const sql2 = "insert into file(writId, fileRoute, fileNo, fileOrgName, fileType) values (?, ?, ?, ?, ?)";
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            };
        });
        res.send('<script>alert("게시글이 등록되었습니다."); location.href="/admin/m_notice/all?noticeId=' + req.body.noticeId + '&page=1";</script>');
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
            let route = req.app.get('views') + '/m_notice/brd_udtForm';
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
    try {
        const param = [req.body.writTitle, req.body.writContent, req.body.writRank, req.body.writRank, req.body.writId];
        const sql1 = "update post set writTitle = ?, writContent = ?, writUpdDate = sysdate(), writRank = if(trim(?)='', null, ?) where writId = ?";
        connection.query(sql1, param, (err) => {
            if (err) {
                console.error(err);
            }
            //파일 안넣고 삭제만 하는 경우에도 fileNo 재설정 해주기 위함.
            const sql3 = "SELECT @fileNo:=0;\
                              UPDATE file SET fileNo=@fileNo:=@fileNo+1 where writId = ?;";
            const param3 = [req.body.writId];
            connection.query(sql3, param3, (err) => {
                if (err) {
                    throw err;
                }
            });
            for (let i = 0; i < paths.length; i++) {
                const sql2 = "insert into file(writId, fileRoute, fileOrgName) values (?, ?, ?)";
                const param2 = [req.body.writId, paths[i], orgName[i]];
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

//공지사항 여러개 삭제
router.get('/noticesDelete', (req, res) => {
    const noticeId = req.query.noticeId;
    const param = req.query.noticeId;
    const str = param.split(',');
    console.log(param);
    for (var i = 0; i < str.length; i++) {
        let fileRoute = [];
        const sql1 = "select fileRoute from file where noticeId = ?";
        connection.query(sql1, str[i], (err, result) => {
            if (err) {
                console.log(err)
            }
            fileRoute = result;
            if (fileRoute != undefined) {
                for (let j = 0; j < fileRoute.length; j++) {
                    fs.unlinkSync(fileRoute[j].fileRoute, (err) => {
                        if (err) {
                            console.log(err);
                        }
                        return;
                    });
                }
            }
        });
        const sql = "delete from notice where noticeId = ?";
        connection.query(sql, str[i], (err) => {
            if (err) {
                console.log(err)
            }
        });
    }
    res.send('<script>alert("삭제되었습니다."); location.href="/admin/m_notice/notice?page=1";</script>');
});

//공지사항 삭제
router.get('/noticeDelete', async (req, res) => {
    try {
        const param = req.query.writId;
        const noticeId = req.query.noticeId;
        // console.log(param);
        const sql = "delete from notice where noticeId = ?";
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
            res.send('<script>alert("게시글이 삭제되었습니다."); location.href="/admin/m_notice/notice?page=1";</script>');
        });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;