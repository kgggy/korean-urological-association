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
router.post('/', async (request, response, next) => {
  const param = [request.body.userEmail, request.body.userPwd]

  let data;
  connection.query('SELECT * FROM user where userEmail = ? and userPwd = ?', param, (err, result, row) => {
    if (err) {
      console.log(err);
      response.json({msg:"query error"});
    }
    if(Object.keys(result).length == 0) {
      data = {msg:"error"};     
    } else {
      data = result;
    }
    response.json(data);
  });
  
  
  //response.end();
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