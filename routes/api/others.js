var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;
// 총칙 파일 다운로드
router.get('/rules/download', async (req, res) => {
  try {
    const sql = "select * from file where fileId = 1 or fileId = 2 or fileId = 3";
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

//역대회장 조회
router.get('/president', async (req, res) => {
  try {
    const sql = "select * from president";
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