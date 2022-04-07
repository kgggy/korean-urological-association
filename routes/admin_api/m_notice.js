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
        sql += " order by 2 desc";
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
router.get('/noticeSelectOne', async (req, res) => {
    try {
        const param = req.query.noticeId;
        const sql = "select *,date_format(noticeWritDate, '%Y-%m-%d') as noticeWritDateFmt\
                        from notice\
                       where noticeId = ?";

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
router.get('/galleryWritForm', async (req, res) => {
    console.log(req.query.uid)
    console.log(req.query.noticeId)
    let route = req.app.get('views') + '/m_notice/notice_writForm.ejs';
    res.render(route, {
        uid: req.query.uid,
        noticeId: req.query.noticeId
    });
});

//공지사항 작성
router.post('/noticewrite', async (req, res, next) => {
    try {
        const param = [req.body.noticeTitle, req.body.noticeContent];
        const sql = "call insertNotice(?,?)";
        connection.query(sql, param, (err) => {
            if (err) {
                throw err;
            }
        });
        res.send('<script>alert("공지사항이 등록되었습니다."); location.href="/admin/m_notice/notice?page=1";</script>');
    } catch (error) {
        res.send(error.message);
    }
});

//게시글 수정 폼 이동
router.get('/noticeUdtForm', async (req, res) => {
    try {
        const param = req.query.noticeId;
        const sql = "select * from notice where noticeId = ?";
        connection.query(sql, param, function (err, result) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_notice/notice_udtForm';
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
router.post('/noticeUpdate', (req, res) => {
    try {
        const param = [req.body.noticeTitle, req.body.noticeContent, req.body.noticeId];
        const sql = "update notice set noticeTitle = ?, noticeContent = ?, noticeWritDate = sysdate() where noticeId = ?";
        connection.query(sql, param, (err) => {
            if (err) {
                console.error(err);
            }
            res.redirect('noticeSelectOne?noticeId=' + req.body.noticeId);
        });
    } catch (error) {
        res.send(error.message);
    }
});

//공지사항 여러개 삭제
router.get('/noticesDelete', (req, res) => {
    const noticeId = req.query.noticeId;
    const param = req.query.noticeId;
    const str = param.split(',');
    console.log(param);
    for (var i = 0; i < str.length; i++) {
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
        const param = req.query.noticeId;
        // console.log(param);
        const sql = "delete from notice where noticeId = ?";
        connection.query(sql, param, (err) => {
            if (err) {
                console.log(err);
            }
            res.send('<script>alert("공지사항이 삭제되었습니다."); location.href="/admin/m_notice/notice?page=1";</script>');
        });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;