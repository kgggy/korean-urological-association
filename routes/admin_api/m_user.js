var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
var url = require('url');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//사용자 전체조회
router.get('/', async (req, res) => {
  try {

    const sql = "select * from user";
    connection.query(sql, function (err, results, fields) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') +'/m_user';
      console.log(route);
      res.render(route, {
        'results' : results
      });
      console.log(results);
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 상세조회
router.get('/selectOne', async (req, res) => {
  try {
    const param = req.query.uid;
    const sql = "select * from user where uid = ?";
    connection.query(sql, param, function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') +'/orgm_viewForm';
      console.log(route);
      res.render(route, {
        'result' : result,
        layout: false
      });
      console.log(result);
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 등록
router.post('/', async (req, res) => {
  const { userEmail, userNick } = req.body;
  let route = req.app.get('views') +'/m_userOne';
  const sameEmailUser = await models.user.findOne({ where: { userEmail } });
  if (sameEmailUser !== null) {
    return res.render(route, {
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

//사용자 정보 수정
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

//사용자 삭제
router.get('/userDelete', (req, res) => {
  const param = req.query.uid;
  // console.log(param);
  const sql = "delete from user where uid = ?";
  connection.query(sql, param, (err, row) => {
    if (err) {
      console.log(err)
    }
    return res.redirect('/admin/m_user');
  });
});

//사용자 권한 변경

module.exports = router;