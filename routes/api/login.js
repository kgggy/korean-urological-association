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

  // const makePasswordHashed = (userEmail, plainPassword) =>
  //   new Promise(async (resolve, reject) => {
  //     // salt를 가져오는 부분은 각자의 DB에 따라 수정
  //     const salt = await carbon.user
  //       .findOne({
  //         attributes: ['userPwd'],
  //         raw: true,
  //         where: {
  //           userEmail,
  //         },
  //       })
  //       .then((result) => result.salt);
  //     crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
  //       if (err) reject(err);
  //       resolve(key.toString('base64'));
  //     });
  //   });
  //  const { userEmail, userPwd: plainPassword } = request.body.user;
  // const userPwd = await makePasswordHashed(userEmail, plainPassword);






  // const param = [request.body.Email, request.body.userPwd, userToken]
  // let data;
  // connection.query('SELECT * FROM user where userEmail = ? and userPwd = ?', param, (err, result, row) => {
  //   if (err) {
  //     console.log(err);
  //     response.json({msg:"query error"});
  //   }
  //   if(Object.keys(result).length == 0) {
  //     data = {msg:"error"};     
  //   } else {
  //     const token = jwt.sign({ userEmail: userEmail }, SECRET_TOKEN, { expiresIn: '7d' });


  //     data = result;
  //   }
  //   response.json(data);
  // });
  
router.post('/', async(req, res) => {
  let { userEmail } = req.body;

  console.log(await models.user.findOne({ where: { userEmail } }));
  
  await models.user.findOne({ where: { userEmail } }, (error, user) => {
    // 에러는 500
    if (error) {
      return res.status(500).json({ error: "오류" });
    }
    if (!user) {
      return res.status(403).json({
        loginSuccess: false,
        message: "해당되는 이메일이 없습니다."
      });
    }
    // email이 맞으니 pw가 일치하는지 검증합니다.
    if(user) {
      const checkPW = () => {
        bcrypt.compare(req.body.userPwd, models.user.userPwd, (error, isMatch) => {
          if (error) {
            return res.status(500).json({ error: "비밀번호가 틀립니다." });
          }
          if (isMatch) {
            // 비밀번호가 맞으면 token을 생성해야 합니다.
            // secret 토큰 값은 특정 유저를 감별하는데 사용합니다.

            // 토큰 생성 7일간 유효
            const token = jwt.sign({ userID: user._id }, SECRET_TOKEN, { expiresIn: '7d' });

            // 해당 유저에게 token값 할당 후 저장
            models.user.token = token;
            user.save((error, user) => {
              if (error) {
                return res.status(400).json({ error: "token 저장 실패" });
              }

              // DB에 token 저장한 후에는 cookie에 토큰을 저장하여 이용자를 식별합니다.
              return res.cookie("x_auth", user.token, {
                  maxAge: 1000 * 60 * 60 * 24 * 7, // 7일간 유지
                  httpOnly: true,
                })
                .status(200)
                .json({ loginSuccess: true, userId: user._id });
            });
          } else {
            return res.status(403).json({
              loginSuccess: false,
              message: "비밀번호가 틀렸습니다."
            });
          }
        });
      };
      return checkPW();
      res.end();
    }
  });
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