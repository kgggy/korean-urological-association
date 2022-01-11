const {
  response
} = require('express');
var express = require('express');
const mysql = require('mysql'); // mysql 모듈 로드
const {
  DEC8_BIN
} = require('mysql/lib/protocol/constants/charsets');
const connt = require("../config/db")
var url = require('url');
const res = require('express/lib/response');

var router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const sql = "select * from user";
    var connection = mysql.createConnection(connt); // DB 커넥션 생성
    connection.connect();
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

// insert
router.post('/user', async (request, response, next) => {
  var connection = mysql.createConnection(connt); // DB 커넥션 생성
  connection.connect();
  const param = [request.body.userEmail, request.body.userNick, request.body.userPwd]

  connection.query('insert into user(`userEmail`, `userNick`, `userPwd`) values (?, ?, ?)', param, (err, row) => {
    if (err) console.log(err)
  });
  response.end()
});

// 삭제
router.delete('/user/:uid', (req, res) => {
  var connection = mysql.createConnection(connt); // DB 커넥션 생성
  connection.connect();
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

// 회원 상세보기
router.get('/user/:uid', async (req, res) => {
  try {
    var connection = mysql.createConnection(connt); // DB 커넥션 생성
    connection.connect();
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
router.patch('/user/:uid', (req, res) => {
  var connection = mysql.createConnection(connt); // DB 커넥션 생성
  connection.connect();
  const param = [req.body.userNick, req.body.userPwd, req.body.userSchool, req.body.userAdres1, req.body.userAdres2, req.body.userImg, req.params.uid];
  console.log(param);
  const sql = "update user set userNick = ?, userPwd = ?, userSchool = ?, userAdres1 = ?, userAdres2 = ?, userImg = ? where uid = ?";
  connection.query(sql, param, (err, row) => {
    if (err) {
      console.error(err);
    }
  });
});

// 닉네임 중복확인
router.get('/user/nick/:userNick', async (req, res) => {
  try {
    var connection = mysql.createConnection(connt); // DB 커넥션 생성
    connection.connect();
    const param = req.params.userNick;
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



module.exports = router;