var express = require('express');
var router = express.Router();
const fs = require('fs');

const sharp = require('sharp');
const multer = require("multer");
const path = require('path');

// DB 커넥션 생성\              
var connection = require('../../config/db').conn;

const {
    ONE_SIGNAL_CONFIG
} = require("../../config/pushNotification_config");
const pushNotificationService = require("../../services/push_Notification.services");

//파일업로드 모듈
var upload = multer({ //multer안에 storage정보  
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            fs.mkdir('uploads/notice', function (err) {
                if (err && err.code != 'EEXIST') {
                    console.log("already exist")
                } else {
                    callback(null, 'uploads/notice');
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

//공지사항 글 전체조회
router.get('/notice', async (req, res) => {
    try {
        var page = req.query.page;
        var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
        var sql = "select *, (select count(*) from comment where comment.boardId = notice.noticeId) as mcount,\
                          (select count(*) from hitCount where hitCount.boardId = notice.noticeId) as hitCount,\
                           date_format(noticeWritDate, '%Y-%m-%d') as noticeWritDateFmt\
                       from notice";
        if (searchText != '') {
            sql += " where noticeTitle like '%" + searchText + "%' or noticeContent like '%" + searchText + "%'";
        }
        sql += " order by noticeFix desc, noticeWritDate desc";
        connection.query(sql, (err, results) => {
            var countPage = 10; //하단에 표시될 페이지 개수
            var page_num = 10; //한 페이지에 보여줄 개수
            var last = Math.ceil((results.length) / page_num); //마지막 장
            var endPage = Math.ceil(page / countPage) * countPage; //끝페이지(10)
            var startPage = endPage - countPage; //시작페이지(1)
            if (err) {
                console.log(err);
            }
            if (last < endPage) {
                endPage = last
            };
            let route = req.app.get('views') + '/m_notice/notice';
            res.render(route, {
                searchText: searchText,
                results: results,
                page: page, //현재 페이지
                length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
                page_num: page_num,
                countPage: countPage,
                startPage: startPage,
                endPage: endPage,
                pass: true,
                last: last
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
    var sql = "select *, (select count(*) from comment where comment.boardId = notice.noticeId) as mcount,\
                        (select count(*) from hitCount where hitCount.boardId = notice.noticeId) as hitCount,\
                        date_format(noticeWritDate, '%Y-%m-%d') as noticeWritDateFmt\
                 from notice";
    if (searchText != '') {
        sql += " where noticeTitle like '%" + searchText + "%' or noticeContent like '%" + searchText + "%'";
    }
    sql += " order by 1 desc";
    connection.query(sql, (err, results) => {
        if (err) {
            console.log(err)
        }
        var countPage = 10; //하단에 표시될 페이지 개수
        var page_num = 10; //한 페이지에 보여줄 개수
        var last = Math.ceil((results.length) / page_num); //마지막 장
        var endPage = Math.ceil(page / countPage) * countPage; //끝페이지(10)
        var startPage = endPage - countPage; //시작페이지(1)
        // ajaxSearch = results;
        if (last < endPage) {
            endPage = last
        };
        res.send({
            ajaxSearch: results,
            page: page, //현재 페이지
            length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
            page_num: page_num,
            countPage: countPage,
            startPage: startPage,
            endPage: endPage,
            pass: true,
            last: last,
            searchText: searchText
        });
        // console.log("page = " + page)
    });
});

//공지사항 글 상세조회
router.get('/noticeSelectOne', async (req, res) => {
    try {
        var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
        const page = req.query.page;
        const param = req.query.noticeId;
        const sql = "select n.*,date_format(n.noticeWritDate, '%Y-%m-%d') as noticeWritDateFmt, f.fileRoute, f.fileOrgName,\
                            (select count(*) from hitCount where hitCount.boardId = n.noticeId) as hitCount\
                        from notice n\
                        left join file f on f.boardId = n.noticeId\
                        where noticeId = ?";

        connection.query(sql, param, (err, result) => {
            if (err) {
                res.json({
                    msg: "select query error"
                });
            }
            let route = req.app.get('views') + '/m_notice/notice_viewForm';
            res.render(route, {
                'result': result,
                page: page,
                searchText: searchText
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 등록 폼 이동
router.get('/noticeWritForm', async (req, res) => {
    let route = req.app.get('views') + '/m_notice/notice_writForm.ejs';
    var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
    res.render(route, {
        uid: req.query.uid,
        noticeId: req.query.noticeId,
        searchText: searchText
    });
});

//공지사항 작성
router.post('/noticewrite', upload.array('file'), async (req, res, next) => {
    try {
        const paths = req.files.map(data => data.path);
        const orgName = req.files.map(data => data.originalname);
        const param = [req.body.noticeTitle, req.body.noticeContent];
        const noticeFix = req.body.noticeFix;

        const sql = "call insertNotice(?,?)";
        for (let i = 0; i < paths.length; i++) {
            if (req.files[i].mimetype == "image/jpeg" || req.files[i].mimetype == "image/jpg" || req.files[i].mimetype == "image/png") {
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
        }
        connection.query(sql, param, (err) => {
            if (err) {
                throw err;
            }
            const sql2 = "SELECT * FROM notice order by noticeWritDate desc limit 1"
            connection.query(sql2, (err, result) => {
                if (err) {
                    throw err;
                }
                for (let i = 0; i < paths.length; i++) {
                    const param3 = [paths[i], orgName[i], result[0].noticeId, path.extname(paths[i])];
                    const sql3 = "insert into file(fileRoute, fileOrgName, boardId, fileType) values (?, ?, ?, ?)";
                    connection.query(sql3, param3, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                };
                const noticeId = result[0].noticeId
                //OneSignal 푸쉬 알림
                var message = {
                    app_id: ONE_SIGNAL_CONFIG.APP_ID,
                    contents: {
                        "en": req.body.noticeTitle
                    },
                    // included_segments: ["All"],
                    included_segments: ["developer"],
                    // "include_player_ids": ["743b6e07-54ed-4267-8290-e6395974acc6"],
                    content_avaliable: true,
                    small_icon: "ic_notification_icon",
                    data: {
                        title: "notice",
                        id: noticeId
                    }
                };
                pushNotificationService.sendNotification(message, (error, results) => {
                    if (error) {
                        return next(error);
                    }
                    return null;
                })
            });
            if (noticeFix == 1) {
                const sql1 = "call noticeFixCheck()";
                connection.query(sql1, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        });
        res.send('<script>alert("공지사항이 등록되었습니다."); location.href="/admin/m_notice/notice?page=1";</script>');
    } catch (error) {
        res.send(error.message);
    }
});

//공지사항 수정 폼 이동
router.get('/noticeUdtForm', async (req, res) => {
    try {
        var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
        const param = req.query.noticeId;
        const sql = "select n.*,date_format(n.noticeWritDate, '%Y-%m-%d') as noticeWritDateFmt, f.fileRoute, f.fileOrgName, f.fileId\
                        from notice n\
                        left join file f on f.boardId = n.noticeId\
                        where noticeId = ?";
        const page = req.query.page;
        connection.query(sql, param, function (err, result) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_notice/notice_udtForm';
            console.log(route);
            res.render(route, {
                'result': result,
                searchText: searchText,
                page: page
            });
        });

    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 수정
router.post('/noticeUpdate', upload.array('file'), (req, res) => {
    try {
        const paths = req.files.map(data => data.path);
        const orgName = req.files.map(data => data.originalname);
        const noticeFix = req.body.noticeFix == undefined ? "0" : req.body.noticeFix;
        const param = [req.body.noticeTitle, req.body.noticeContent, noticeFix, req.body.noticeId];
        const sql = "update notice set noticeTitle = ?, noticeContent = ?, noticeFix = ? where noticeId = ?";
        var searchText = req.body.searchText == undefined ? "" : req.body.searchText;
        const page = req.body.page;
        for (let i = 0; i < paths.length; i++) {
            if (req.files[i].mimetype == "image/jpeg" || req.files[i].mimetype == "image/jpg" || req.files[i].mimetype == "image/png") {
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
        }
        connection.query(sql, param, (err) => {
            if (err) {
                console.error(err);
            }
            for (let i = 0; i < paths.length; i++) {
                const sql2 = "insert into file(fileRoute, fileOrgName, boardId, fileType) values (?, ?, ?, ?)";
                const param2 = [paths[i], orgName[i], req.body.noticeId, path.extname(paths[i])];
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            };
            res.redirect('noticeSelectOne?noticeId=' + req.body.noticeId + '&page=' + page + '&searchText=' + searchText);
        });
    } catch (error) {
        res.send(error.message);
    }
});

//공지사항 여러개 삭제
router.get('/noticesDelete', (req, res) => {
    const param = req.query.noticeId;
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
        const sql = "call deleteNotice(?)";
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
        const sql = "call deleteNotice(?)";
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
            res.send('<script>alert("공지사항이 삭제되었습니다."); location.href="/admin/m_notice/notice?page=1";</script>');
        });
    } catch (error) {
        res.send(error.message);
    }
});

//첨부파일 삭제
router.get('/noticeFileDelete', async (req, res) => {
    const param = req.query.fileId;
    const fileRoute = req.query.fileRoute;
    const page = req.query.page;
    var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
    try {
        const sql = "delete from file where fileId = ?";
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
    res.redirect('noticeUdtForm?noticeId=' + req.query.noticeId + '&page=' + page + '&searchText=' + searchText);
});
module.exports = router;