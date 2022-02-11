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

//탄소실천, 챌린지 주제 전체 조회
router.get('/:certiDivision', async (req, res) => {
    try {
        const param = req.params.certiDivision;
        const sql = "select * from certification where certiDivision = ? and certiShow not in('1')";
        let certifications;
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            certifications = results;
            res.status(200).json(certifications);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천, 챌린지 글 주제별 전체 썸네일 조회
router.get('/certiContents/:certiTitleId', async (req, res) => {
    try {
        const param = req.params.certiTitleId;
        const sql = "select f.fileRoute, c.certiContentId\
                       from file f \
                       join certiContent c\
                         on f.certiContentId = c.certiContentId\
                      where c.certiTitleId = ? and f.fileNo = 0";
        let certiContents;
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            certiContents = results;
            res.status(200).json(certiContents);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천, 챌린지 게시글 상세조회
router.get('/one/:certiContentId', async (req, res) => {
    try {
        const param = req.params.certiContentId;
        const sql = "select f.fileRoute,\
                            (select count(*) from recommend where certiContentId = ?) as rcount,\
                            (select count(*) from comment where certiContentId = ?) as mcount,\
                             c.uid\
                       from certiContent c\
                  left join file f on c.certiContentId = f.certiContentId\
                  left join comment m on m.certiContentId = c.certiContentId\
                  left join recommend r on r.certiContentId = c.certiContentId\
                 where c.certiContentId = ?";
        let certi;
        connection.query(sql, [param, param, param], (err, result) => {
            if (err) {
                console.error(err);
                res.json({
                    msg: "query error"
                });
            }
            certi = result;
            res.status(200).json(certi);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//탄소실천, 챌린지 게시글(사진) 업로드
router.post('/', upload.array('file'), async function (req, res) {
    // console.log(req.files);
    // console.log(req.query);
    // console.log(uuid());

    // req.files.map(data => {
    //     console.log("폼에 정의된 필드명 : ", data.fieldname);
    //     console.log("사용자가 업로드한 파일 명 : ", data.originalname);
    //     console.log("파일의 엔코딩 타입 : ", data.encoding);
    //     console.log("파일의 Mime 타입 : ", data.mimetype);
    //     console.log("파일이 저장된 폴더 : ", data.destination);
    //     console.log("destinatin에 저장된 파일 명 : ", data.filename);
    //     console.log("업로드된 파일의 전체 경로 ", data.path);
    //     console.log("파일의 바이트(byte 사이즈)", data.size);
    // })

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

//탄소실천, 챌린지 글 삭제
router.delete('/:certiContentId', async (req, res) => {
    try {
        const param = req.params.certiContentId;
        const sql = "delete from certiContent where certiContentId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                response.json({
                    msg: "query error"
                });
            }
            res.json({
                msg: "success"
            })
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

module.exports = router;