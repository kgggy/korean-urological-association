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

const connt = require("../../config/db")
var url = require('url');

const password_hash = bcrypt.hashSync('dummy', 10);

// DB 커넥션 생성
var connection = mysql.createConnection(connt); 
connection.connect();

// 회원가입
router.post('/', async (request, response) => {
  const param = [request.body.userEmail, request.body.userNick, request.body.userPwd]
  connection.query('insert into user(`userEmail`, `userNick`, `userPwd`) values (?, ?, ?)', param, (err, row) => {
    if (err) {
      console.log(err);
      response.json({msg:"query error"});
    }
  });
  response.json({msg:"success"});
  response.end()
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