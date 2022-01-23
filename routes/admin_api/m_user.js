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
      
      res.render(req.app.get('views') +'/memberList', {
        'results' : results
      });
      // console.log(user);
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});
// router.get('/', (req, res) => {
//   var data = { name: 'john', age: 20 };
//   res.render('/ejs/memberList', { data: data });
// })

//사용자 상세조회

//사용자 정보 수정
// router.patch('/' async (req, res) => {
//   try {
//     const sql = "update ";
//   }
// })

//사용자 삭제

//사용자 권한 변경

module.exports = router;