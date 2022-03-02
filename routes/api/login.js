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
  try {
    const param = [request.body.userToken, request.body.userSocialDiv];
    let email;
    connection.query('select userEmail, userPwd, uid from user where userToken = ? and userSocialDiv = ?', param, (err, result, row) => {
      if (err) {
        console.log(err);
        response.json({
          msg: "querry error"
        });
      } 
      if (Object.keys(result).length == 0) {
        response.send("null");
      } 
      else {
        email = result;
      }
      console.log(Object.keys(result).length);
      response.json(email);
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//일반 로그인
router.post('/', async (req, res) => {
  const {
    userPwd,
    userEmail
  } = req.body;

  const emailChk = await models.user.findOne({
    where: {
      userEmail
    }
  });

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
  const dbPwd = await models.user.findOne({
    where: {
      userEmail
    }
  });
  console.log(dbPwd);
  if (password == dbPwd.userPwd) { // dbPwd: ['userPwd'] 해도 됨
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

//소셜 로그인(토큰, 닉네임)
router.post('/social', async (req, res) => {
  try {
    const sql = "select * from user where userToken = ?";
    connection.query(sql, req.body.userToken, function (err, results, fields) {
      if (err) {
        console.log(err);
      }
      console.log(results);
      if (results.length > 0) {
        res.send(results);
      } else {
        res.json([{msg : 'false'}]);
      }
      return;
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});


//관리자 로그인
router.post('/admin', async (req, res) => {
  const {
    userPwd,
    userNick
  } = req.body;

  // if(userEmail == null) {
  //   return res.json({
  //   isEmailEmpty : true,
  //   message: "이메일을 입력해주세요.",
  // });
  // } 

  const nickChk = await models.user.findOne({
    where: {
      userNick
    }
  });

  if (nickChk == null) {
    res.send('<script>alert("아이디를 다시 확인해주세요."); location.href="/";</script>')
    return false;
  }

  const pwdChk = await models.user.findOne({
    where: {
      userPwd
    }
  });

  if (pwdChk == null) {
    return res.send('<script>alert("패스워드를 다시 확인해주세요."); location.href="/";</script>')
  }

  if (nickChk != null && pwdChk != null) {
    res.redirect('/admin/m_user/page?page=1');
  }

  // const makePasswordHashed = (userEmail, plainPassword) =>
  //   new Promise(async (resolve, reject) => {
  //     // salt를 가져오는 부분은 각자의 DB에 따라 수정
  //     const salt = await models.user
  //       .findOne({
  //         attributes: ['salt'],
  //         raw: true,
  //         where: {
  //           userEmail,
  //         },
  //       }).then((result) => result.salt);
  //     console.log(salt);

  //     crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
  //       if (err) reject(err);
  //       resolve(key.toString('base64'));
  //     });
  //   });

  // const password = await makePasswordHashed(userEmail, userPwd);
  // const dbPwd = await models.user.findOne({ where: { userEmail } });
  // console.log(dbPwd);
  // if (password == dbPwd.userPwd) {  // dbPwd: ['userPwd'] 해도 됨
  //   res.json(
  //     dbPwd
  //   );

  // } else {
  //   res.json({
  //     pwdChk: false,
  //     message: "비밀번호를 확인해주세요.",
  //   });
  // }
});


//token값 저장
router.patch('/:uid', async (request, response, next) => {
  const param = [request.body.userToken, request.params.uid]

  connection.query('update user set userToken = ? where uid = ?', param, (err, row) => {
    if (err) {
      console.log(err);
      response.json({
        msg: "query error"
      });
    }
  });
  response.json({
    msg: "success"
  });
  response.end()
});


module.exports = router;