var express = require('express');
var router = express.Router();
const fs = require('fs');
const sharp = require('sharp');
const multer = require("multer");
const path = require('path');             
var connection = require('../../config/db').conn;

//파일업로드 모듈
var upload = multer({ //multer안에 storage정보  
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            //파일이 이미지 파일이면
                // console.log("이미지 파일입니다.");
                callback(null, 'uploads/gallery');
                //텍스트 파일이면
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

//행사목록 전체조회
router.get('/', async (req, res) => {
    try {
        var page = req.query.page;
        // var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
        // var keepSearch = "&searchText=" + searchText;
        var sql = "select * from event";
        connection.query(sql, (err, results) => {
            var last = Math.ceil((results.length) / 15);
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_event/event';
            res.render(route, {
                // searchText: searchText,
                results: results,
                page: page,
                length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
                page_num: 10, //한 페이지에 보여줄 개수
                pass: true,
                last: last,
                // keepSearch: keepSearch
            });
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//갤러리 검색(ajax)
router.get('/gallerySearch', async (req, res) => {
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

//갤러리 글 상세조회
router.get('/gallerySelectOne', async (req, res) => {
    try {
        const param = req.query.galleryId;
        const sql = "select g.*, date_format(galleryWritDate, '%Y-%m-%d') as galleryWritDateFmt, f.fileRoute\
                        from gallery g\
                        left join file f on f.boardId = g.galleryId\
                        where g.galleryId = ?";

        connection.query(sql, param, (err, result) => {
            if (err) {
                res.json({
                    msg: "select query error"
                });
            }
            let route = req.app.get('views') + '/m_gallery/gallery_viewForm';
            res.render(route, {
                'result': result
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//갤러리 등록 폼 이동
router.get('/galleryWritForm', async (req, res) => {
    console.log(req.query.uid)
    console.log(req.query.galleryId)
    let route = req.app.get('views') + '/m_gallery/gallery_writForm.ejs';
    res.render(route, {
        uid: req.query.uid,
        galleryId: req.query.galleryId
    });
});

// 갤러리 등록
router.post('/galleryWrite', upload.array('file'), async (req, res, next) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    console.log(paths);
    console.log(orgName);
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

        const param1 = [req.body.galleryTitle, req.body.galleryContent];
        const sql1 = "call insertgallery(?,?)";
        connection.query(sql1, param1, (err) => {
            if (err) {
                throw err;
            }
            const sql2 = "SELECT * FROM gallery order by galleryWritDate desc limit 1"
            connection.query(sql2, (err, result) => {
                if (err) {
                    throw err;
                }
                for (let i = 0; i < paths.length; i++) {
                    console.log(result);
                    const param3 = [paths[i], orgName[i], result[0].galleryId];
                    const sql3 = "insert into file(fileRoute, fileOrgName, boardId) values (?, ?, ?)";
                    connection.query(sql3, param3, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                };
            });
        });
        //fcm
        var firebaseToken;
        const token = "select pushToken from user where pushToken is not null";
        connection.query(token, (err, result) => {
            if (err) {
                throw err;
            }
            for (var i = 0; i < result.length; i++) {
                firebaseToken = result[i].pushToken;
                pushing.sendFcmMessage({
                    "message": {
                        "token": firebaseToken,
                        "notification": {
                            "body": "공지사항을 확인해주세요.",
                            "title": "ECOCE 공지사항"
                        },
                        "data": {
                            "action": "notice"
                        }
                    }
                });
            }
            res.send('<script>alert("갤러리가 등록되었습니다."); location.href="/admin/m_gallery/gallery?&page=1";</script>');
        });
    } catch (error) {
        res.send(error.message);
    }
});

//게시글 수정 폼 이동
router.get('/galleryUdtForm', async (req, res) => {
    try {
        const param = req.query.galleryId;
        const sql = "select g.*, date_format(galleryWritDate, '%Y-%m-%d') as galleryWritDateFmt, f.fileRoute, f.fileOrgName, f.fileId\
                        from gallery g\
                        left join file f on f.boardId = g.galleryId\
                        where g.galleryId = ?";
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

//갤러리 수정
router.post('/galleryUpdate', upload.array('file'), (req, res) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    try {
        const param1 = [req.body.galleryTitle, req.body.galleryContent, req.body.galleryId];
        const sql1 = "update gallery set galleryTitle = ?, galleryContent = ?, galleryWritDate = sysdate() where galleryId = ?";
        connection.query(sql1, param1, (err) => {
            if (err) {
                console.error(err);
            }
            for (let i = 0; i < paths.length; i++) {
                const sql2 = "insert into file(fileRoute, fileOrgName, boardId) values (?, ?, ?)";
                const param2 = [paths[i], orgName[i], req.body.galleryId];
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            };
            res.redirect('gallerySelectOne?galleryId=' + req.body.galleryId);
        });
    } catch (error) {
        res.send(error.message);
    }
});

//공지사항 여러개 삭제
router.get('/gallerysDelete', (req, res) => {
    const param = req.query.galleryId;
    const str = param.split(',');
    for (var i = 0; i < str.length; i++) {
        let fileRoute = [];
        const sql1 = "select fileRoute from file where boardId = ?";
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
        const sql = "call deleteGallery(?)";
        connection.query(sql, str[i], (err) => {
            if (err) {
                console.log(err)
            }
        });
    }
    res.send('<script>alert("삭제되었습니다."); location.href="/admin/m_gallery/gallery?page=1";</script>');
});

//갤러리 삭제
router.get('/galleryDelete', async (req, res) => {
    try {
        const param = req.query.galleryId;
        // console.log(param);
        const sql = "call deleteGallery(?)";
        connection.query(sql, param, (err) => {
            if (err) {
                console.log(err);
            }
            if (req.query.fileRoute != undefined) {
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
            res.send('<script>alert("갤러리가 삭제되었습니다."); location.href="/admin/m_gallery/gallery?page=1";</script>');
        });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;