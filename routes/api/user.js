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
const connt = require("../../config/db")
var models = require("../../models");
const crypto = require('crypto');

// DB 커넥션 생성
var connection = mysql.createConnection(connt); 
connection.connect();

// // 회원가입
router.post('/', async (req, res) => {
  const { userEmail, userNick } = req.body;

  const sameEmailUser = await models.user.findOne({ where: { userEmail } });
  if (sameEmailUser !== null) {
    return res.json({
      registerSuccess: false,
      message: "이미 존재하는 이메일입니다",
    });
  }

  const sameNickNameUser = await models.user.findOne({ where: { userNick } });
  if (sameNickNameUser !== null) {
    return res.json({
      registerSuccess: false,
      message: "이미 존재하는 닉네임입니다.",
    });
  }

  const createSalt = () =>
    new Promise((resolve, reject) => {
      crypto.randomBytes(64, (err, buf) => {
        if (err) reject(err);
        resolve(buf.toString('base64'));
      });
    });

  const createHashedPassword = (plainPassword) =>
    new Promise(async (resolve, reject) => {
      const salt = await createSalt();
      crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve({ userPwd: key.toString('base64'), salt });
      });
    });
  
  const { userPwd, salt } = await createHashedPassword(req.body.userPwd);
  
  await models.user.create({
    userPwd,
    salt,
    userEmail,
    userNick
  })
  res.json({ msg: "success" });
});

// 회원 상세보기
router.get('/:uid', async (req, res) => {
  try {
    const param = req.params.uid;
    let user;
    connection.query('select * from user where uid = ?', param, (err, results, fields) => {
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

// 회원정보수정
router.patch('/:uid', (req, res) => {
  const param = [req.body.userNick, req.body.userPwd, req.body.userSchool, req.body.userAdres1, req.body.userAdres2, req.body.userImg, req.params.uid];
  console.log(param);
  const sql = "update user set userNick = ?, userPwd = ?, userSchool = ?, userAdres1 = ?, userAdres2 = ?, userImg = ? where uid = ?";
  connection.query(sql, param, (err, row) => {
    if (err) {
      console.error(err);
    }
  });
});

//패스워드 변경
router.post('/pwdUpdate/:uid', async (req, res) => {
  const uid = req.params.uid;
  const userPwd = req.body.userPwd;

  const makePasswordHashed = (plainPassword) =>
    new Promise(async (resolve, reject) => {
      // salt를 가져오는 부분은 각자의 DB에 따라 수정
      const salt = await models.user
        .findOne({
          attributes: ['salt'],
          raw: true,
          where: {
            uid: uid,
          },
        }).then((result) => result.salt);

      crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve(key.toString('base64'));
      });
    });

  const password = await makePasswordHashed(userPwd);
  console.log(`password: ${password}`);

  const dbPwd = await models.user.findOne({ attributes: ['userPwd'], where: { uid: uid } });
  console.log(`dbPwd: ${dbPwd.userPwd}`);
  if (password == dbPwd.userPwd) {  // dbPwd: ['userPwd'] 해도 됨
    res.json({
      isSamePreviousPwd: true,
      msg: "기존 비밀번호와 다르게 입력해주세요."
    });
    // console.log(password);
    // console.log(dbPwd);
  } else {
    models.user.update({
      userPwd: password
    }, { where: { uid: uid } });
    res.json({
      pwdUpdate: true,
      msg: "패스워드 변경 완료"
    });
  }
});

//   models.user.update({
//     userPwd: password
//   }, { where: { uid: uid } });
//   res.json({
//     pwdUpdate: true,
//     message: "패스워드 변경 완료"
//   })
// });

  
// 회원 삭제
router.delete('/:uid', (req, res) => {
  const param = req.params.uid;
  // console.log(param);
  const sql = "delete from user where uid = ?";
  connection.query(sql, param, (err, row) => {
    if (err) {
      console.log(err)
    }
    res.end();
  });
});


module.exports = router;