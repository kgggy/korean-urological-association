var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const connt = require("../../config/db")

// DB 커넥션 생성
// var connection = mysql.createConnection(connt);
// connection.connect();
var connection = require('../../config/db').conn;
// 총칙 파일 다운로드
router.get('/rules/download', async (req, res) => {
  try {
    const sql = "select * from file where fileId = 1";
    let route;
    connection.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json({
          msg: "query error"
        });
      }
      route = result;
      res.status(200).json(route);
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//연혁 조회
router.get('/history', async (req, res) => {
  try {
    const sql = "select * from history";
    let route;
    connection.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json({
          msg: "query error"
        });
      }
      route = result;
      res.status(200).json(route);
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//병원 주소
router.get('/companyAdres', async (req, res) => {
  try {
    const sql = "select userAdres1, userAdres2, userWorkplace from user";
    let route;
    connection.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        res.json({
          msg: "query error"
        });
      }
      route = result;
      res.status(200).json(route);
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

module.exports = router;