const multer = require("multer");
const path = require('path');
const fs = require('fs');

var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

//파일 업로드 모듈
var upload = multer({ //multer안에 storage정보  
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            //파일이 이미지 파일이면
            if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
                // console.log("이미지 파일입니다.");
                callback(null, 'public/img/banner');
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
        fileSize: 1024 * 1024 * 1024 //1기가
    },

});

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//배너 등록
router.post('/', upload.single('file'), async function (req, res) {
    console.log(decodeURI(req.file.originalname));
    try {
        const param = [req.file.path, req.body.startDate, req.body.endDate, req.body.showYN, req.body.showNo];
        const sql = "insert into banner(bannerRoute, startDate, endDate, showYN, showNo) values(?, ?, ?, ?, ?)";
        connection.query(sql, param, (err) => {
            if (err) {
                throw err;
            }
            return res.json({
                msg: "success"
            });
        });
    } catch (error) {
        res.send(error.message);
    }
});

//배너 삭제

//배너 수정

module.exports = router;