const multer = require("multer");
const path = require('path');
const fs = require('fs');

var express = require('express');
var router = express.Router();
const mysql = require('mysql');

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

//파일 업로드 모듈
var upload = multer({ //multer안에 storage정보  
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            //파일이 이미지 파일이면
            if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
                // console.log("이미지 파일입니다.");
                callback(null, 'public/images/certification');
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

//탄소실천, 챌린지 주제 전체 조회
router.get('/certiAll', async (req, res) => {
    try {
        var page = req.query.page;
        var param = req.query.certiDivision;
        var division = req.query.division == undefined ? "" : req.query.division;
        var searchType = req.query.searchType == undefined ? "" : req.query.searchType;
        var c_searchType = req.query.c_searchType == undefined ? "" : req.query.c_searchType;
        var keepSearch = "&searchType=" + searchType + "&division=" + division + "&c_searchType=" + c_searchType;
        var sql = "select *, date_format(certiStartDate, '%Y-%m-%d') as certiStartDatefmt, date_format(certiEndDate, '%Y-%m-%d') as certiEndDatefmt\
                     from certification where certiDivision = ? and nullif(certiTitle,'') is not null";
        var div = "";
        if (division != '') {
            sql += " and certiSubDivision = '" + division + "' \n";
        }
        if (searchType != '') {
            sql += " and certiDiff = '" + searchType + "' \n";
        }
        if (c_searchType != '') {
            sql += " and certiShow = '" + c_searchType + "' \n";
        }
        sql += " order by certiTitleId desc;"
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
        connection.query(sql, param, (err, results) => {
            var last = Math.ceil((results.length) / 10);
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_certification/certification';
            res.render(route, {
                div: div,
                division: division,
                searchType: searchType,
                c_searchType: c_searchType,
                results: results,
                page: page,
                length: results.length - 1,
                page_num: 10,
                pass: true,
                last: last,
                param: param,
                keepSearch: keepSearch
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//종류 상세조회
router.get('/selectOne', async (req, res) => {
    try {
        const param = req.query.certiTitleId;
        const sql = "select c.*, f.fileRoute, f.fileOrgName, f.fileNo, date_format(c.certiStartDate, '%Y-%m-%d') as certiStartDatefmt, date_format(c.certiEndDate, '%Y-%m-%d') as certiEndDatefmt\
                      from certification c\
                      left join file f on f.certiTitleId = c.certiTitleId\
                     where c.certiTitleId = ? order by f.fileNo";
        connection.query(sql, param, function (err, result) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_certification/certi_viewForm';
            res.render(route, {
                result: result
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천 등록 페이지로 이동
router.get('/certiWritForm', async (req, res) => {
    const division = req.query.certiDivision;
    try {
        //분류
        const sql = "select count(*), certiSubDivision\
                       from certification\
                      where certiSubDivision !='' or not null group by certiSubDivision";
        connection.query(sql, (err, div) => {
            if (err) {
                console.log(err)
            }
            let route = req.app.get('views') + '/m_certification/certi_writForm';
            res.render(route, {
                division: division,
                div: div
            });
        })
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천 종류 등록
router.post('/certiWrit', upload.array('file'), async (req, res, next) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    console.log(paths, orgName)
    try {
        var param = "";
        if (req.files != null) {
            param = [req.body.certiDivision, req.body.certiTitle, req.body.certiDetail, req.body.certiPoint, req.body.certiDiff, paths[0], req.body.certiSubDivision, req.body.certiStartDate, req.body.certiEndDate, req.body.certiShow];
        } else {
            param = [req.body.certiDivision, req.body.certiTitle, req.body.certiDetail, req.body.certiPoint, req.body.certiDiff, req.body.certiImage, req.body.certiSubDivision, req.body.certiStartDate, req.body.certiEndDate, req.body.certiShow];
        }
        const sql = "insert into certification(certiDivision, certiTitle, certiDetail, certiPoint, certiDiff, certiImage, certiSubDivision, certiStartDate, certiEndDate, certiShow)\
                          values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        // console.log(param);
        connection.query(sql, param, function (err) {
            if (err) {
                console.log(err);
            }
        });
        for (let i = 0; i < paths.length - 1; i++) {
            const param2 = [paths[i + 1], i + 1, orgName[i + 1]];
            console.log("param2(종류등록 파일배열) = " + param2);
            const sql2 = "insert into file(certiTitleId, fileRoute, fileNo, fileOrgName) values ((select max(certiTitleId) from certification), ?, ?, ?)";
            connection.query(sql2, param2, (err) => {
                if (err) {
                    throw err;
                }
            });
        };
        res.redirect('certiAll?certiDivision=' + req.body.certiDivision + '&page=1');
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천 수정 페이지로 이동
router.get('/certiUdtForm', async (req, res) => {
    try {
        const result = [req.query];
        console.log(result)
        // 분류 드롭다운 가져오기
        const sql2 = "select count(*), certiSubDivision\
                       from certification\
                      where certiSubDivision !='' or not null group by certiSubDivision";
        connection.query(sql2, (err, div) => {
            if (err) {
                console.log(err)
            }
            let route = req.app.get('views') + '/m_certification/certi_udtForm';
            res.render(route, {
                div: div,
                result: result
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천 종류 수정
router.post('/certiUpdate', upload.single('file'), async (req, res) => {
    var path = "";
    var param = "";
    console.log(req.body);
    if (req.file != null) {
        path = req.file.path;
        param = [req.body.certiTitle, req.body.certiDetail, req.body.certiPoint,
            req.body.certiDiff, path, req.body.certiShow, req.body.certiStartDate, req.body.certiEndDate, req.body.certiSubDivision, req.body.certiTitleId
        ];
    } else {
        param = [req.body.certiTitle, req.body.certiDetail, req.body.certiPoint,
            req.body.certiDiff, req.body.certiImage, req.body.certiShow, req.body.certiStartDate, req.body.certiEndDate, req.body.certiSubDivision, req.body.certiTitleId
        ];
    }
    const sql = "update certification set certiTitle = ?, certiDetail = ?, certiPoint = ?, certiDiff = ?, certiImage = ?, certiShow = ?, certiStartDate = ?, certiEndDate = ?, certiSubDivision = ?\
                                 where certiTitleId = ?";
    connection.query(sql, param, (err, row) => {
        if (err) {
            console.error(err);
        }
        res.redirect('selectOne?certiTitleId=' + req.body.certiTitleId);
    });
});

//탄소실천, 챌린지 종류 삭제
router.get('/certiDelete', async (req, res) => {
    try {
        const param = req.query.certiTitleId;
        const sql = "delete from certification where certiTitleId = ?";
        connection.query(sql, param, (err) => {
            if (err) {
                console.log(err);
            }
            if (req.query.certiImage != '') {
                fs.unlinkSync(req.query.certiImage, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
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
            res.redirect('certiAll?certiDivision=' + req.query.certiDivision + '&page=1');
        });

    } catch (error) {
        res.send(error.message);
    }
});

//탄소실천 이미지 삭제
router.get('/certiImgDelete', async (req, res) => {
    const param = req.query.certiImage;
    // console.log(typeof(param))
    try {
        const sql = "update certification set certiImage = null where certiTitleId = ?";
        connection.query(sql, req.query.certiTitleId, (err) => {
            if (err) {
                console.log(err)
            }
            fs.unlinkSync(param, (err) => {
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
    res.redirect('certiUdtForm?certiTitleId=' + req.query.certiTitleId);
});


module.exports = router;