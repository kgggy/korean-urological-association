// const {
//   response
// } = require('express');
// const {
//   DEC8_BIN
// } = require('mysql/lib/protocol/constants/charsets');
// const res = require('express/lib/response');
var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const models = require("../../models");
const connt = require("../../config/db")
var url = require('url'); 
const crypto = require('crypto');

// DB 커넥션 생성
var connection = mysql.createConnection(connt); 
connection.connect();

// 토큰 확인 
router.post('/tokenCheck', async (request, response, next) => {
  const param = [request.body.userToken]

  let token;
  connection.query('select * from user where userToken = ?', param, (err, result, row) => {
    if (err) {
      console.log(err);
      response.json({ msg: "querry error" });
    }
    if (Object.keys(result).length == 0) {
      token = { msg: "error" };
    } else {
      token = result;
    }
    response.json(token);
  });
});

  
  //로그인
router.post('/', async (req, res) => {
  const { userPwd, userEmail } = req.body;

  // if(userEmail == null) {
  //   return res.json({
  //   isEmailEmpty : true,
  //   message: "이메일을 입력해주세요.",
  // });
  // } 

  const emailChk = await models.user.findOne({ where: { userEmail } });
  if (emailChk == null) {
    return res.json({
      emailChk: false,
      message: "이메일을 다시 확인해주세요.",
    });
  }

  const makePasswordHashed = (userEmail, plainPassword) =>
    new Promise(async (resolve, reject) => {
      // salt를 가져오는 부분은 각자의 DB에 따라 수정
      const salt = await models.user
        .findOne({
          attributes: ['salt'],
          raw: true,
          where: {
            userEmail,
          },
        }).then((result) => result.salt);
      console.log(salt);

      crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve(key.toString('base64')); 
      });
    });
  
  const password = await makePasswordHashed(userEmail, userPwd);
  const dbPwd = await models.user.findOne({ where: { userEmail } });
  console.log(dbPwd);
  if (password == dbPwd.userPwd) {  // dbPwd: ['userPwd'] 해도 됨
    res.json(
      dbPwd
    );

  } else {
    res.json({
      pwdChk: false,
      message: "비밀번호를 확인해주세요.",
    });
  }
});



//token값 저장
router.patch('/:uid', async (request, response, next) => {
  const param = [request.body.userToken, request.params.uid]

  connection.query('update user set userToken = ? where uid = ?', param, (err, row) => {
    if (err) {
      console.log(err);
      response.json({msg:"query error"});
    }
  });
  response.json({msg:"success"});
  response.end()
});


module.exports = router;