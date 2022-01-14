const multer = require("multer");
const path = require('path');
const fs = require('fs');

var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

const {
    v4: uuidv4
} = require('uuid');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

// const upload = multer({
//     dest: 'uploads/images'
// })

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
                console.log("이미지 파일입니다.")
                callback(null, 'uploads/images')
                //텍스트 파일이면
            } else if (file.mimetype == "application/pdf" || file.mimetype == "application/txt" || file.mimetype == "application/octet-stream") {
                console.log("텍스트 파일입니다.")
                callback(null, 'uploads/texts')
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

//탄소실천, 챌린지 게시글(사진) 업로드
router.post('/uploadFiles', upload.array('file'), async function (req, res) {
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
    //console.log(paths);
    try {
        const contentId = uuid();
        const param1 = [contentId, req.query.certiTitleId, req.query.uid];
        const sql1 = "insert into certiContent(certiContentId, certiTitleId, uid) values(?, ?, ?)";
        connection.query(sql1, param1, (err) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < paths.length; i++) {
                const param2 = [contentId, paths[i], i];
                // console.log(param2);
                const sql2 = "insert into file(certiContentId, fileRoute, fileNo) values (?, ?, ?)";
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    } else {
                      return;
                    }
                });

            };
        });
        return res.json({
            msg: "success"
        });
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
                msg: "content delete success"
            })
        });
    } catch (error) {
        res.send(error.message);
    }
});


module.exports = router;