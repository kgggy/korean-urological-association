var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const fs = require('fs');

const connt = require("../../config/db")
var url = require('url');
const { type } = require('os');

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
      res.render(route, {
        'result': result,
        layout: false
      });
      console.log(result);
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 정보 수정 페이지 이동
router.get('/userUdtForm', async (req, res) => {
  try {
    const param = req.query.uid;
    const sql = "select * from user where uid = ?";
    connection.query(sql, param, function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') +'/orgm_udtForm';
      console.log(route);
      res.render(route, {
        'result': result,
        layout: false
      });
      console.log(result);
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 정보 수정
router.post('/userUpdate', (req, res) => {
  const param = [req.body.userNick, req.body.userEmail, req.body.userAge,
                 req.body.userAdres1, req.body.userAdres2, req.body.userSchool, 
                 req.body.userPoint, req.body.userScore, req.body.userStatus,
                 req.body.userAgree, req.body.userAuth, req.body.uid];
  // const uid = req.body.uid;
  // console.log("=========" + param);
  // console.log("=========" + uid);
  const sql = "update user set userNick = ?, userEmail = ?, userAge = ?, userAdres1 = ?, userAdres2 = ?,\
                               userSchool = ?, userPoint = ?, userScore = ?, userStatus = ?, userAgree = ?, userAuth = ?\
                               where uid = ?";
  connection.query(sql, param, (err, row) => {
    if (err) {
      console.error(err);
    }
    res.redirect('selectOne?uid=' + req.body.uid);
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
    res.send("<script>opener.parent.location.reload(); window.close();</script>");
  });
});

//사용자 권한 변경

module.exports = router;