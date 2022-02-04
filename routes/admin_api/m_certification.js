const multer = require("multer");
const path = require('path');
const fs = require('fs');

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
        const param = req.query.certiDivision;
        const sql = "select * from certification where certiDivision = ?";
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            let route = req.app.get('views') + '/m_certification/certification';
            res.render(route, {
                'results': results
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천, 챌린지 게시글(사진) 업로드
router.post('/', upload.single('file'), async function (req, res) {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    console.log(paths);
    try {
        const contentId = uuid();
        const param1 = [contentId, req.query.certiTitleId, req.query.uid];
        const sql1 = "insert into certiContent(certiContentId, certiTitleId, uid) values(?, ?, ?)";
        connection.query(sql1, param1, (err) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < paths.length; i++) {
                const param2 = [contentId, paths[i], i, orgName[i]];
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
        return res.json(paths);
    } catch (error) {
        res.send(error.message);
    }
});

//탄소실천, 챌린지 종류 삭제
router.post('/certiDelete', async (req, res) => {
    try {
        const param = req.query.certiTitleId;
        console.log(param);
        const sql = "delete from certification where certiTitleId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            res.redirect('certiAll?certiDivision=' + req.query.certiDivision);
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

//탄소실천 이미지 삭제
router.get('/imgDelete', async (req, res) => {
    const param = req.query.certiImage;
    try {
        const sql = "update certification set certiImage = null where certiTitleId = ?";
        connection.query(sql, req.query.certiTitleId, (err, row) => {
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

//탄소실천 등록 페이지로 이동
router.get('/certiWritForm', async (req, res) => {
    const division = req.query.certiDivision;
    let route = req.app.get('views') + '/m_certification/certi_writForm';
    res.render(route, {
        'division': division,
        layout: false
    });
});

//탄소실천 등록
router.post('/certiWrit', upload.single('file'), async (req, res) => {
    try {
        var path = "";
        var param = "";
        if (req.file != null) {
            path = req.file.path;
            param = [req.body.certiDivision, req.body.certiTitle, req.body.certiDetail, req.body.certiPoint, req.body.certiDiff, path];
        } else {
            param = [req.body.certiDivision, req.body.certiTitle, req.body.certiDetail, req.body.certiPoint, req.body.certiDiff, req.body.certiImage];
        }
        const sql = "insert into certification(certiDivision, certiTitle, certiDetail, certiPoint, certiDiff, certiImage)\
                          values (?, ?, ?, ?, ?, ?)";
        connection.query(sql, param, function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            res.send("<script>opener.parent.location.reload(); window.close();</script>");
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천 수정 페이지로 이동
router.get('/certiUdtForm', async (req, res) => {
    try {
        const param = req.query.certiTitleId;
        const sql = "select * from certification where certiTitleId = ?";
        connection.query(sql, param, function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_certification/certi_udtForm';
            res.render(route, {
                'result': result,
                layout: false
            });
            console.log(result);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천 종류 수정
router.post('/certiUpdate', upload.single('file'), async (req, res) => {
    var path = "";
    var param = "";
    if (req.file != null) {
        path = req.file.path;
        param = [req.body.certiTitle, req.body.certiDetail, req.body.certiPoint,
            req.body.certiDiff, path, req.body.certiShow, req.body.certiTitleId
        ];
    } else {
        param = [req.body.certiTitle, req.body.certiDetail, req.body.certiPoint,
            req.body.certiDiff, req.body.certiImage, req.body.certiShow, req.body.certiTitleId
        ];
    }
    const sql = "update certification set certiTitle = ?, certiDetail = ?, certiPoint = ?, certiDiff = ?, certiImage = ?, certiShow = ?\
                                 where certiTitleId = ?";
    connection.query(sql, param, (err, row) => {
        if (err) {
            console.error(err);
        }
        res.send("<script>opener.parent.location.reload(); window.close();</script>");
    });
});

//탄소실천 글 전체보기

module.exports = router;