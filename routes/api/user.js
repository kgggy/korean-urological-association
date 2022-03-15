var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const connt = require("../../config/db")
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const crypto = require('crypto');

const multer = require("multer");
const path = require('path');
const fs = require('fs');


// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//파일업로드 모듈
var upload = multer({ //multer안에 storage정보  
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      //파일이 이미지 파일이면
      if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "application/octet-stream") {
        // console.log("이미지 파일입니다.");
        callback(null, 'uploads/userProfile');
        //텍스트 파일이면
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

// 전체 회원 목록
router.get('/all', async (req, res) => {
  try {
    let user;
    connection.query('select * from user', (err, results, fields) => {
      if (err) {
        console.log(err);
      }
      user = results;
      res.status(200).json(user);
    });
    console.log(user)
  } catch (error) {
    res.status(401).send(error.message);
  }
});

module.exports = router;