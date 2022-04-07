var express = require('express');
var router = express.Router();
const fs = require('fs');
const sharp = require('sharp');

const multer = require("multer");
const path = require('path');

// DB 커넥션 생성             
var connection = require('../../config/db').conn;

//파일업로드 모듈
var upload = multer({ //multer안에 storage정보  
    // dest: 'uploads/gallery',
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            fs.mkdir('uploads/reference', function (err) {
                if (err && err.code != 'EEXIST') {
                    console.log("already exist")
                } else {
                    callback(null, 'uploads/reference');
                }
            })
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

//자료실 글 전체조회
router.get('/reference', async (req, res) => {
    try {
        var page = req.query.page;
        var sql = "select *,  date_format(referWritDate, '%Y-%m-%d') as referWritDateFmt\
                       from reference order by 2 desc";
        connection.query(sql, (err, results) => {
            var last = Math.ceil((results.length) / 15);
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_refer/reference';
            res.render(route, {
                results: results,
                page: page,
                length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
                page_num: 15, //한 페이지에 보여줄 개수
                pass: true,
                last: last
            });
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//게시글 검색(ajax)
router.get('/referSearch', async (req, res) => {
    var page = req.query.page;
    var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
    var keepSearch = "&searchText=" + searchText;
    var sql = "select *,  date_format(galleryWritDate, '%Y-%m-%d') as galleryWritDateFmt from gallery";
    if (searchText != '') {
        sql += " where galleryTitle like '%" + searchText + "%' or galleryContent like '%" + searchText + "%'";
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

//자료실 글 상세조회
router.get('/referSelectOne', async (req, res) => {
    try {
        const param = req.query.referId;
        const page = req.query.page;
        const sql = "select r.*, date_format(referWritDate, '%Y-%m-%d') as referWritDateFmt, f.fileRoute\
                        from reference r\
                        left join file f on f.boardId = r.referId\
                       where referId = ?";
        connection.query(sql, param, (err, result) => {
            if (err) {
                res.json({
                    msg: "select query error"
                });
            }
            console.log(result)
            let route = req.app.get('views') + '/m_refer/refer_viewForm';
            res.render(route, {
                'result': result,
                page: page
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 등록 폼 이동
router.get('/referWritForm', async (req, res) => {
    let route = req.app.get('views') + '/m_refer/refer_writForm.ejs';
    res.render(route);
});

// 자료실 등록
router.post('/referWrite', upload.array('file'), async (req, res, next) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    try {
        for (let i = 0; i < paths.length; i++) {
            if (req.files[i].size > 1000000) {
                sharp(paths[i]).resize({
                        width: 2000
                    }).withMetadata() //이미지 방향 유지
                    .toBuffer((err, buffer) => {
                        if (err) {
                            throw err;
                        }
                        fs.writeFileSync(paths[i], buffer, (err) => {
                            if (err) {
                                throw err
                            }
                        });
                    });
            }
        }

        const param1 = [req.body.referTitle, req.body.referContent];
        const sql1 = "call insertReference(?,?)";
        connection.query(sql1, param1, (err) => {
            if (err) {
                throw err;
            }
            const sql2 = "SELECT * FROM reference order by referWritDate desc limit 1"
            connection.query(sql2, (err, result) => {
                if (err) {
                    throw err;
                }
                for (let i = 0; i < paths.length; i++) {
                    const param3 = [paths[i], orgName[i], result[0].referId];
                    const sql3 = "insert into file(fileRoute, fileOrgName, boardId) values (?, ?, ?)";
                    connection.query(sql3, param3, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                };
            });
        });
        // //fcm
        // var firebaseToken;
        // const token = "select pushToken from user where pushToken is not null";
        // connection.query(token, (err, result) => {
        //     if (err) {
        //         throw err;
        //     }
        //     for (var i = 0; i < result.length; i++) {
        //         firebaseToken = result[i].pushToken;
        //         pushing.sendFcmMessage({
        //             "message": {
        //                 "token": firebaseToken,
        //                 "notification": {
        //                     "body": "공지사항을 확인해주세요.",
        //                     "title": "ECOCE 공지사항"
        //                 },
        //                 "data": {
        //                     "action": "notice"
        //                 }
        //             }
        //         });
        //     }
            res.send('<script>alert("게시글이 등록되었습니다."); location.href="/admin/m_refer/reference?&page=1";</script>');
        // });
    } catch (error) {
        res.send(error.message);
    }
});

//게시글 수정 폼 이동
router.get('/galleryUdtForm', async (req, res) => {
    try {
        const param = req.query.galleryId;
        const sql = "select * from gallery where galleryId = ?";
        connection.query(sql, param, function (err, result) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_gallery/gallery_udtForm';
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
router.post('/galleryUpdate', (req, res) => {
    try {
        const param = [req.body.galleryTitle, req.body.galleryContent, req.body.galleryId];
        const sql = "update gallery set galleryTitle = ?, galleryContent = ?, galleryWritDate = sysdate() where galleryId = ?";
        connection.query(sql, param, (err) => {
            if (err) {
                console.error(err);
            }
            res.redirect('gallerySelectOne?galleryId=' + req.body.galleryId);
        });
    } catch (error) {
        res.send(error.message);
    }
});

//공지사항 여러개 삭제
router.get('/refersDelete', (req, res) => {
    const galleryId = req.query.galleryId;
    const param = req.query.galleryId;
    const str = param.split(',');
    console.log(param);
    for (var i = 0; i < str.length; i++) {
        const sql = "delete from gallery where galleryId = ?";
        connection.query(sql, str[i], (err) => {
            if (err) {
                console.log(err)
            }
        });
    }
    res.send('<script>alert("삭제되었습니다."); location.href="/admin/m_gallery/gallery?page=1";</script>');
});

//공지사항 삭제
router.get('/galleryDelete', async (req, res) => {
    try {
        const param = req.query.galleryId;
        // console.log(param);
        const sql = "delete from gallery where galleryId = ?";
        connection.query(sql, param, (err) => {
            if (err) {
                console.log(err);
            }
            res.send('<script>alert("공지사항이 삭제되었습니다."); location.href="/admin/m_gallery/gallery?page=1";</script>');
        });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;