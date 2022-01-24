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
      // console.log(user);
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 상세조회
router.get('/', async (req, res) => {
  try {
    const param = req.query.uid;
    const sql = "select * from user where uid = ?";
    connection.query(sql, param, function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') +'/m_user';
      console.log(route);
      res.render(route, {
        'result' : result
      });
      // console.log(user);
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});


//사용자 정보 수정
// router.patch('/' async (req, res) => {
//   try {
//     const sql = "update ";
//   }
// })

//사용자 삭제

//사용자 권한 변경

module.exports = router;