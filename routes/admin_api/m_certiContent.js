const multer = require("multer");
const path = require('path');
const fs = require('fs');
const {
    parse
} = require("csv-parse");

var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');
// const upload = require('./file.js');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

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
        const param = req.query.certiDivision;
        const sql = "select distinct f.fileRoute, c.certiContentId, c.certiTitleId, f.fileNo, e.certiDivision, c.certiContentDate\
                       from certiContent c\
                  left join file f on f.certiContentId = c.certiContentId\
                  left join certification e on e.certiTitleId = c.certiTitleId\
                      where e.certiDivision = ? and f.fileNo = 1\
                      order by c.certiContentDate desc";
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
            }
            var last = Math.ceil((results.length) / 12);
            let route = req.app.get('views') + '/m_certiContent/certiContent';
            res.render(route, {
                searchType: null,
                searchText: null,
                results: results,
                page: page,
                length: results.length - 1,
                page_num: 12,
                pass: true,
                param: param,
                last: last
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천, 챌린지 게시글 상세보기
router.get('/one', async (req, res) => {
    try {
        const param = req.query.certiContentId;
        const sql = "select f.fileRoute, e.certiTitle,\
                            (select count(*) from recommend where certiContentId = ?) as rcount,\
                             c.uid, c.certiContentId, date_format(c.certiContentDate, '%Y-%m-%d') as certiContentDatefmt, u.userNick, u.userImg\
                       from certiContent c\
                  left join certification e  on c.certiTitleId = e.certiTitleId\
                  left join file f on c.certiContentId = f.certiContentId\
                  left join recommend r on r.certiContentId = c.certiContentId\
                  left join user u on c.uid = u.uid\
                 where c.certiContentId = ?";
        connection.query(sql, [param, param, param], (err, result) => {
            if (err) {
                console.error(err);
                res.json({
                    msg: "query error"
                });
            }
            let route = req.app.get('views') + '/m_certiContent/certiCont_viewForm';
            res.render(route, {
                'result': result,
                layout: false
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천, 챌린지 게시글(사진) 업로드
router.post('/certiContWrit', upload.array('file'), async function (req, res) {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    console.log(paths);
    try {
        const contentId = uuid();
        const param1 = [contentId, req.body.certiTitleId, req.body.uid];
        const sql1 = "insert into certiContent(certiContentId, certiTitleId, uid) values(?, ?, ?)";
        connection.query(sql1, param1, (err) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < paths.length; i++) {
                const param2 = [contentId, paths[i], i + 1, orgName[i]];
                // console.log(param2);
                const sql2 = "insert into file(certiContentId, fileRoute, fileNo, fileOrgName) values (?, ?, ?, ?)";
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    } else {
                        return;
                    }
                });

            };
        });
        res.send("<script>opener.parent.location.reload(); window.close();</script>");
    } catch (error) {
        res.send(error.message);
    }
});

//탄소실천, 챌린지 글 삭제
router.get('/certiContDelete', async (req, res) => {
    try {
        const param = req.query.certiContentId;
        const fileRoute = req.query.fileRoute;
        console.log(req.query.certiDivision);
        const sql = "delete from certiContent where certiContentId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
            }
            if (fileRoute != '') {
                fs.unlinkSync(fileRoute, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    return;
                });
            }
            res.send("<script>opener.parent.location.reload(); window.close();</script>");
        });
    } catch (error) {
        res.send(error.message);
    }
});

//파일 다운로드
router.get('/download/:certiContentId/:fileNo', async (req, res) => {
    try {
        const param = [req.params.certiContentId, req.params.fileNo];
        const sql = "select fileRoute from file where certiContentId = ? and fileNo = ?";
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

//탄소실천 글 수정
router.post('/certiContUpdate', upload.array('file'), async (req, res) => {
    const param = [req.file.path, req.body.certiContentId];
    try {
        const sql = "update file set fileRoute = ? where certiContentId = ?";
        connection.query(sql, param, (err) => {
            if (err) {
                console.log(err)
            }
            fs.unlinkSync(req.body.fileRoute, (err) => {
                if (err) {
                    console.log(err);
                }
                return;
            });
        })
        res.redirect('one?certiContentId=' + req.body.certiContentId);
    } catch (error) {
        if (error.code == "ENOENT") {
            console.log("탄소실천 이미지 삭제 에러 발생");
        }
    }
});

//탄소실천글 등록 페이지로 이동
router.get('/certiWritForm', async (req, res) => {
    const division = req.query.certiDivision;
    console.log(division)
    const sql = "select certiTitleId, certiTitle, certiDiff from certification where certiDivision = 0";
    // 분류 드롭다운 가져오기
    const sql2 = "select count(*), certiSubDivision\
    from certification\
   where certiSubDivision !='' or not null group by certiSubDivision";
    connection.query(sql2, (err, results1) => {
        if (err) {
            console.log(err)
        }
        div = results1;
    })
    connection.query(sql, (err, titles) => {
        if (err) {
            console.log(err)
        }
        let route = req.app.get('views') + '/m_certiContent/certiCont_writForm';
        res.render(route, {
            division: division,
            titles: titles,
            div: div
        });
    });
});

//분류 드롭다운 가져오기(ajax)
router.get('/certiWritForm_subdropdown', async (req, res) => {
    const param = req.query.param;
    const sql = "select certiTitle from certification where certiSubDivision = ? and  nullif(certiTitle,'') is not null";
    connection.query(sql, param, (err, results) => {
        if (err) {
            console.log(err)
        }
        div = JSON.stringify(results);
        // let route = req.app.get('views') + '/m_certiContent/certiCont_writForm';
        // res.render(route, {
        //     div: div
        // });
        res.send(div);
    });
});

//탄소실천 글 등록
router.post('/', upload.array('file'), async function (req, res) {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    console.log(req.body);
    try {
        const contentId = uuid();
        const param1 = [contentId, req.body.certiTitleId, req.body.uid];
        const sql1 = "insert into certiContent(certiContentId, certiTitleId, uid) values(?, ?, ?)";
        connection.query(sql1, param1, (err) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < paths.length; i++) {
                const param2 = [contentId, paths[i], i + 1, orgName[i]];
                console.log(param2);
                const sql2 = "insert into file(certiContentId, fileRoute, fileNo, fileOrgName) values (?, ?, ?, ?)";
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    } else {
                        return;
                    }
                });

            };
        });
        res.send("<script>opener.parent.location.reload(); window.close();</script>");
    } catch (error) {
        res.send(error.message);
    }
});

//탄소실천글 수정 페이지로 이동
router.get('/certiContUdtForm', async (req, res) => {
    try {
        const param = req.query.certiContentId;
        const sql = "select f.fileRoute, f.fileOrgName,\
                            (select count(*) from recommend where certiContentId = ?) as rcount,\
                            c.uid, c.certiContentId, date_format(c.certiContentDate, '%Y-%m-%d') as certiContentDatefmt, u.userNick, u.userImg\
                      from certiContent c\
                 left join file f on c.certiContentId = f.certiContentId\
                 left join recommend r on r.certiContentId = c.certiContentId\
                 left join user u on c.uid = u.uid\
                    where c.certiContentId = ?"
        connection.query(sql, [param, param, param], function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_certiContent/certiCont_udtForm';
            res.render(route, {
                'result': result,
                layout: false
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천, 챌린지 게시글 별 댓글 전체조회
router.get('/certiComment', async (req, res) => {
    try {
        const param = req.query.certiContentId;
        const sql = "select * from comment where certiContentId = ?";
        let comment;
        connection.query(sql, param, (err, results) => {
            if (err) {
                res.json({
                    msg: "query error"
                });
            }
            let route = req.app.get('views') + '/m_certiContent/certiCont_cmtViewForm';
            res.render(route, {
                'results': results,
                layout: false
            });
        })
    } catch (error) {
        res.send(error.message);
    }
});

//탄소 실천 글 검색
router.get('/search', async (req, res) => {
    const searchType = req.query.searchType;
    const searchText = req.query.searchText;
    const page = req.query.page;
    try {
        if (searchType == "0") {
            res.redirect('certiContentAll?certiDivision=' + req.query.certiDivision + "&page=1");
        } else if (searchType == "certiTitleId") {
            const sql = "select distinct f.fileRoute, c.certiContentId, c.certiTitleId, f.fileNo, e.certiDivision, c.certiContentDate\
            from certiContent c\
       left join file f on f.certiContentId = c.certiContentId\
       left join certification e on e.certiTitleId = c.certiTitleId\
           where e.certiDivision = ? and f.fileNo = 1\
           order by c.certiContentDate desc";
            connection.query(sql, searchType, (err, results, row) => {
                if (err) {
                    console.error(err);
                }
                let route = req.app.get('views') + '/m_certification/certification';
                res.render(route, {
                    searchType: searchType,
                    searchText: searchText,
                    results: results,
                    page: page,
                    length: results.length - 1,
                    page_num: 12,
                    pass: true
                });
            })
        } else if (searchType == "userNick") {
            const sql = "select distinct f.fileRoute, c.certiContentId, c.certiTitleId, f.fileNo, e.certiDivision, c.certiContentDate\
            from certiContent c\
       left join file f on f.certiContentId = c.certiContentId\
       left join certification e on e.certiTitleId = c.certiTitleId\
           where e.certiDivision = ? and f.fileNo = 1\
           order by c.certiContentDate desc";
            connection.query(sql, searchType, (err, results, row) => {
                if (err) {
                    console.error(err);
                }
                let route = req.app.get('views') + '/m_certification/certification';
                res.render(route, {
                    searchType: searchType,
                    searchText: searchText,
                    results: results,
                    page: page,
                    length: results.length - 1,
                    page_num: 12,
                    pass: true
                });
            })
        }
    } catch (error) {
        res.status(401).send(error.message);
    }
});

module.exports = router;