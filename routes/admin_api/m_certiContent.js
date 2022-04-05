const multer = require("multer");
const path = require('path');
const fs = require('fs');

var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")

// DB 커넥션 생성
//var connection = mysql.createConnection(connt);
//connection.connect();                    
var connection = require('../../config/db').conn;

//uuid 생성
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
            if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
                // console.log("이미지 파일입니다.");
                callback(null, 'uploads/certiImgs');
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

//탄소실천, 챌린지 글 주제별 전체 썸네일 조회
router.get('/certiContentAll', async (req, res) => {
    try {
        var page = req.query.page;
        var param = req.query.certiDivision;
        var certiSubDivision = req.query.certiSubDivision == undefined ? "" : req.query.certiSubDivision;
        var searchType = req.query.searchType == undefined ? "" : req.query.searchType;
        var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
        var keepSearch = "&certiSubDivision=" + certiSubDivision + "&searchType=" + searchType + "&searchText=" + searchText;
        var sql = "select distinct f.fileRoute, c.certiContentId, c.certiTitleId, f.fileNo, e.certiDivision, c.certiContentDate, e.certiTitle, u.uid,\
        (select count(*) from comment where comment.certiContentId = c.certiContentId) as commentyn\
        from certiContent c\
        left join file f on f.certiContentId = c.certiContentId\
        left join certification e on e.certiTitleId = c.certiTitleId\
        left join user u on u.uid = c.uid\
        where e.certiDivision = ? and f.fileNo = 1";
        if (certiSubDivision != '') {
            sql += " and e.certiSubDivision = '" + certiSubDivision + "' \n";
        }
        if (searchType != '') {
            sql += " and e.certiTitleId = '" + searchType + "' \n";
        }
        if (searchText != '') {
            sql += " and u.userNick like '%" + searchText + "%'";
        }
        sql += " order by c.certiContentDate desc";
        // console.log(sql)
        //탄소실천 분류 드롭다운 가져오기
        const sql2 = "select count(*), certiSubDivision\
                       from certification\
                       where certiSubDivision !='' or not null group by certiSubDivision";
        var div = "";
        connection.query(sql2, (err, results1) => {
            if (err) {
                console.log(err)
            }
            div = results1;
        })

        //챌린지 분류 드롭다운 가져오기
        const sql3 = "select certiTitle\
                       from certification\
                       where certiDivision = 1";
        var c_div = "";
        connection.query(sql3, (err, results2) => {
            if (err) {
                console.log(err)
            }
            c_div = results2;
        })
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
            }
            var last = Math.ceil((results.length) / 12);
            let route = req.app.get('views') + '/m_certiContent/certiContent';
            res.render(route, {
                param: param,
                div: div,
                certiSubDivision: certiSubDivision,
                searchType: searchType,
                searchText: searchText,
                results: results,
                page: page,
                length: results.length - 1,
                page_num: 12,
                pass: true,
                last: last,
                keepSearch: keepSearch,
                c_div: c_div
            });
            // console.log(c_div)
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천, 챌린지 게시글 상세보기
router.get('/one', async (req, res) => {
    try {
        const param = req.query.certiContentId;
        const division = req.query.certiDivision;
        const sql = "select distinct f.fileRoute, f.fileOrgName, e.certiTitle, e.certiSubDivision,\
                            (select count(*) from recommend where certiContentId = ?) as rcount,\
                             c.uid, c.comId, c.certiContentId, date_format(c.certiContentDate, '%Y-%m-%d') as certiContentDatefmt, u.userNick, u.userImg, p.comNick\
                       from certiContent c\
                  left join certification e  on c.certiTitleId = e.certiTitleId\
                  left join file f on c.certiContentId = f.certiContentId\
                  left join recommend r on r.certiContentId = c.certiContentId\
                  left join user u on c.uid = u.uid\
                  left join company p on p.comId = c.comId\
                 where c.certiContentId = ?";
        connection.query(sql, [param, param], (err, result) => {
            if (err) {
                console.error(err);
            }
            let route = req.app.get('views') + '/m_certiContent/certiCont_viewForm';
            res.render(route, {
                result: result,
                division: division
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천글 등록 페이지로 이동
router.get('/certiWritForm', async (req, res) => {
    const division = req.query.certiDivision;
    // console.log(division)
    const sql = "select certiTitleId, certiTitle, certiDiff from certification where certiDivision = 0";
    // 탄소실천 분류 드롭다운 가져오기
    const sql2 = "select count(*), certiSubDivision\
                    from certification\
                   where certiSubDivision !='' or not null group by certiSubDivision";
    connection.query(sql2, (err, results1) => {
        if (err) {
            console.log(err)
        }
        div = results1;
    })
    // 챌린지 분류 드롭다운 가져오기
    const sql3 = "select count(*), certiTitle, certiTitleId\
                    from certification\
                   where certiDivision = 1\
                group by certiTitle, certiTitleId";
    connection.query(sql3, (err, results2) => {
        if (err) {
            console.log(err)
        }
        c_div = results2;
    })
    connection.query(sql, (err, titles) => {
        if (err) {
            console.log(err)
        }
        let route = req.app.get('views') + '/m_certiContent/certiCont_writForm';
        res.render(route, {
            division: division,
            titles: titles,
            div: div,
            c_div: c_div
        });
    });
});

//분류 드롭다운 가져오기(ajax)
router.get('/certiWritForm_subdropdown', async (req, res) => {
    const param = req.query.param;
    const sql = "select certiTitle, certiTitleId from certification where certiSubDivision = ? and  nullif(certiTitle,'') is not null";
    connection.query(sql, param, (err, results) => {
        if (err) {
            console.log(err)
        }
        secondDiv = JSON.stringify(results);
        res.send(secondDiv);
    });
});

//탄소실천, 챌린지 게시글 + 사진 업로드
router.post('/certiContWrit', upload.array('file'), async function (req, res) {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    // console.log(paths);
    try {
        const contentId = uuid();
        const sessionUid = req.session.user.comId;
        const param1 = [contentId, req.body.certiTitleId, sessionUid];
        const sql1 = "insert into certiContent(certiContentId, certiTitleId, comId) values(?, ?, ?)";
        connection.query(sql1, param1, (err) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < paths.length; i++) {
                const param2 = [contentId, paths[i], i + 1, orgName[i], path.extname(paths[i])];
                // console.log(param2);
                const sql2 = "insert into file(certiContentId, fileRoute, fileNo, fileOrgName, fileType) values (?, ?, ?, ?, ?)";
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    } else {
                        return;
                    }
                });

            };
        });
        res.send('<script>alert("게시글이 등록되었습니다."); location.href="/admin/m_certiContent/certiContentAll?certiDivision=' + req.body.certiDivision + '&page=1";</script>');
    } catch (error) {
        res.send(error.message);
    }
});

//탄소실천, 챌린지 글 삭제
router.get('/certiContDelete', async (req, res) => {
    try {
        const param = req.query.certiContentId;
        const sql = "delete from certiContent where certiContentId = ?";
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
            res.send('<script>alert("게시글이 삭제되었습니다."); location.href="/admin/m_certiContent/certiContentAll?certiDivision=' + req.query.certiDivision + '&page=1";</script>');
        });
    } catch (error) {
        res.send(error.message);
    }
});

//첨부파일 삭제
router.get('/fileDelete', async (req, res) => {
    console.log("aaa")
    const param = [req.query.certiContentId, req.query.fileNo];
    console.log(param)
    const fileRoute = req.query.fileRoute;
    try {
        const sql = "delete from file where certiContentId = ? and fileNo = ?";
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
        res.redirect('certiContUdtForm?certiContentId=' + req.query.certiContentId + '&certiDivision=' + req.query.certiDivision);
    } catch (error) {
        if (error.code == "ENOENT") {
            console.log("탄소실천/챌린지 첨부파일 삭제 에러 발생");
        }
    }
});

//탄소실천글 수정 페이지로 이동
router.get('/certiContUdtForm', async (req, res) => {
    try {
        const param = req.query.certiContentId;
        const division = req.query.certiDivision;
        const sql = "select f.fileRoute, f.fileOrgName, f.fileNo, e.certiSubDivision, e.certiTitle, e.certiTitleId,\
                            (select count(*) from recommend where certiContentId = ?) as rcount,\
                            c.uid, c.certiContentId, date_format(c.certiContentDate, '%Y-%m-%d') as certiContentDatefmt, u.userNick, u.userImg\
                      from certiContent c\
                 left join file f on c.certiContentId = f.certiContentId\
                 left join certification e on c.certiTitleId = e.certiTitleId\
                 left join recommend r on r.certiContentId = c.certiContentId\
                 left join user u on c.uid = u.uid\
                    where c.certiContentId = ?"
        // 탄소실천 대분류 드롭다운 가져오기
        const sql2 = "select count(*), certiSubDivision\
                        from certification\
                       where certiSubDivision !='' or not null group by certiSubDivision";
        connection.query(sql2, (err, results1) => {
            if (err) {
                console.log(err)
            }
            div = results1;
        })
        // 챌린지 분류 드롭다운 가져오기
        const sql3 = "select count(*), certiTitle, certiTitleId\
                        from certification\
                       where certiDivision = 1\
                    group by certiTitle, certiTitleId";
        connection.query(sql3, (err, results2) => {
            if (err) {
                console.log(err)
            }
            c_div = results2;
        })
        connection.query(sql, [param, param], function (err, result) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_certiContent/certiCont_udtForm';
            res.render(route, {
                result: result,
                division: division,
                div: div,
                c_div: c_div
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천 글 수정
router.post('/certiContUpdate', upload.array('file'), async (req, res) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    console.log(req.body);
    try {
        const param = [req.body.certiTitleId, req.body.certiContentId];
        const sql = "update certiContent set certiTitleId = ? where certiContentId = ?";
        connection.query(sql, param, (err) => {
            if (err) {
                console.log(err)
            }
            for (let i = 0; i < paths.length; i++) {
                const sql2 = "insert into file(certiContentId, fileRoute, fileOrgName) values (?, ?, ?)";
                const param2 = [req.body.certiContentId, paths[i], orgName[i]];
                // console.log(param2);
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    }
                    const sql3 = "SELECT @fileNo:=0;\
                                      UPDATE file SET fileNo=@fileNo:=@fileNo+1 where certiContentId = ?;";
                    const param3 = [req.body.certiContentId];
                    connection.query(sql3, param3, (err) => {
                        if (err) {
                            throw err;
                        }
                        // console.log("fileNo update success");
                    });

                });
            };
        })
        res.redirect('one?page=1&certiDivision=' + req.body.certiDivision + '&certiContentId=' + req.body.certiContentId);
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;