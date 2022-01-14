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
const bcrypt = require('bcrypt');
const saltRounds = 10;

const connt = require("../../config/db")
var url = require('url');
var models = require("../../models");


// DB 커넥션 생성
var connection = mysql.createConnection(connt); 
connection.connect();

// 회원가입
router.post('/', async (req, res) => {
  // const inputPwd = request.body.userPwd;
  // const salt = crypto.randomBytes(100).toString('base64');
  // const hashPassword = crypto
  //   .createHash('sha512')
  //   .update(inputPwd + salt)
  //   .digest('hex');
  // const createSalt = () =>
  //   new Promise((resolve, reject) => {
  //     crypto.randomBytes(64, (err, buf) => {
  //       if (err) reject(err);
  //       resolve(buf.toString('base64'));
  //     });
  //   });

  // const createHashedPassword = (plainPassword) =>
  //   new Promise(async (resolve, reject) => {
  //     const salt = await createSalt();
  //     crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
  //       if (err) reject(err);
  //       resolve({ userPwd: key.toString('base64'), salt });
  //     });
  //   });

  // const { userPwd, salt } = await createHashedPassword(request.body.userPwd);  --> crypto 이용

  let { userEmail, userNick, userPwd} = req.body;
  const sameEmailUser = await models.user.findOne({ where: {userEmail} });
  if (sameEmailUser !== null) {
    return res.json({
      registerSuccess: false,
      message: "이미 존재하는 이메일입니다",
    });
  }

  const sameNickNameUser = await models.user.findOne({ where: {userNick} });
  if (sameNickNameUser !== null) {
    return res.json({
      registerSuccess: false,
      message: "이미 존재하는 닉네임입니다.",
    });
  }



  // 솔트 생성 및 해쉬화 진행
  bcrypt.genSalt(saltRounds, (err, salt) => {
    // 솔트 생성 실패시
    if (err)
      return res.status(500).json({
        registerSuccess: false,
        message: "비밀번호 솔트 생성 실패.",
      });

    // salt 생성에 성공시 hash 진행
    bcrypt.hash(userPwd, salt, async (err, hash) => {
      if (err)
        return res.status(500).json({
          registerSuccess: false,
          message: "비밀번호 해쉬화 실패.",
        });

      // 비밀번호를 해쉬된 값으로 대체합니다.
      userPwd = hash;

      // const param = [req.body.userEmail, req.body.userNick, userPwd]
      // connection.query('insert into user(`userEmail`, `userNick`, `userPwd`) values (?, ?, ?)', param, (err, rows, fields) => {
      //   if (err) {
      //     console.log(err);
      //     res.json({ msg: "query error" });
      //   } else {
      //     res.json({ msg: "success" });
      //   }
      // });
      const user = await new models.user({
        userEmail,
        userNick,
        userPwd,
      });

      user.save((err) => {
        if (err) return res.json({ registerSuccess: false, message: err });
      });
      return res.json({ registerSuccess: true });
    });
    });
  });

// 닉네임 중복확인
router.get('/nick/:userNick', async (req, res) => {
  try {
    const param = decodeURIComponent(req.params.userNick);
    let nick;
    connection.query('select count(*) as checkNick from user where userNick = ?', param, (err, results) => {
      if (err) {
        console.log(err);
      }
      nick = results;
      res.send(nick);
    });
    console.log(nick);
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//전체 회원 조회
router.get('/', async (req, res) => {
  try {
    const sql = "select * from user";   
    let user;
    models.user.findAll().then(console.log);
    connection.query(sql, function (err, results, fields) {
      if (err) {
        console.log(err);
      }
      user = results;
      res.status(200).json(user);
      // console.log(user);
    });
    console.log(user)

  } catch (error) {

    res.status(401).send(error.message);
  }

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

// //패스워드 변경
router.get('/pwdUpdate/:uid', (req, res) => {
  console.log(__dirname);
  res.sendFile('/Users/flash51/ecoce_server/views/pwdUpdate.html');
});

router.post('/pwdUpdate', (req, res) => {
  const param = [req.body.userPwd, req.body.uid];
  const sql = "update user set userPwd = ? where uid = ?";
  connection.query(sql, param, (err, row) => {
      if (err) {
          console.error(err);
      }
      res.json({ msg: "success" });
  });
});


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