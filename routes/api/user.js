var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;

// 전체 회원 목록
router.get('/all', async (req, res) => {
  //업데이트 된 버전
  if(req.query.version == version) {
    try {
      const page = parseInt(req.query.page);
      const uid = req.query.uid;
      let user;
      let userPosition;
      let userAdres2;
      let userType;
      var sql = "";
      var param = [];
      if(req.query.page != 'null') {
        sql = "select u.*, p.psd from user u\
            left join president p on p.uid = u.uid where u.uid <= 10000\
             order by field(u.uid, ?) desc, u.userRank is null, u.userRank asc limit 15 offset ?";
        param = [uid, page * 15];
      } else {
        sql = "select u.*, p.psd from user u left join president p on p.uid = u.uid where u.uid <= 10000 order by field(u.uid, ?) desc, u.userRank is null, u.userRank asc";
        param = [uid]
      }
      connection.query(sql, param, (err, results, fields) => {
        if (err) {
          console.log(err);
        }
        user = results;
        const userPositionSql = "select distinct userPosition from user where userPosition is not null and userPosition != ''  order by field(userPosition, '전체') desc, userPosition asc;";
        connection.query(userPositionSql, (err, results) => {
          if (err) {
            console.log(err);
          }
          userPosition = results;
          const userAdres2Sql = "select distinct userAdres2 from user where userAdres2 is not null and userAdres2 != '' order by field(userAdres2, '지역') desc, userAdres2 asc;";
          connection.query(userAdres2Sql, (err, results) => {
            if (err) {
              console.log(err);
            }
            userAdres2 = results;
            const userTypeSql = "select distinct userType from user where userType is not null and userType != '' order by field(userType, '형태') desc, userType asc;";
            connection.query(userTypeSql, (err, results) => {
              if (err) {
                console.log(err);
              }
              userType = results;
              res.status(200).json({
                user: user,
                userPosition: userPosition,
                userAdres2: userAdres2,
                userType: userType
              });
            })
          });
        });
      });
    } catch (error) {
      res.status(401).send(error.message);
    }
  } else {
    try {
      const page = parseInt(req.query.page);
      let user;
      let userPosition;
      let userAdres2;
      let userType;
      var sql = "";
      var param = [];
      if(req.query.page != 'null') {
        sql = "select u.*, p.psd from user u\
            left join president p on p.uid = u.uid where u.uid <= 10000\
             order by u.userRank is null, u.userRank asc limit 15 offset ?";
        param = page * 15;
      } else {
        sql = "select u.*, p.psd from user u left join president p on p.uid = u.uid where u.uid <= 10000 order by u.userRank is null, u.userRank asc";
      }
      connection.query(sql, param, (err, results, fields) => {
        if (err) {
          console.log(err);
        }
        user = results;
        const userPositionSql = "select distinct userPosition from user where userPosition is not null and userPosition != ''  order by field(userPosition, '전체') desc, userPosition asc;";
        connection.query(userPositionSql, (err, results) => {
          if (err) {
            console.log(err);
          }
          userPosition = results;
          const userAdres2Sql = "select distinct userAdres2 from user where userAdres2 is not null and userAdres2 != '' order by field(userAdres2, '지역') desc, userAdres2 asc;";
          connection.query(userAdres2Sql, (err, results) => {
            if (err) {
              console.log(err);
            }
            userAdres2 = results;
            const userTypeSql = "select distinct userType from user where userType is not null and userType != '' order by field(userType, '형태') desc, userType asc;";
            connection.query(userTypeSql, (err, results) => {
              if (err) {
                console.log(err);
              }
              userType = results;
              res.status(200).json({
                user: user,
                userPosition: userPosition,
                userAdres2: userAdres2,
                userType: userType
              });
            })
          });
        });
      });
    } catch (error) {
      res.status(401).send(error.message);
    }
  }
});

//회원 검색
router.get('/search', async (req, res) => {
  const page = parseInt(req.query.page);
  var userPosition = req.query.userPosition == undefined ? "" : req.query.userPosition;
  var userAdres2 = req.query.userAdres2 == undefined ? "" : req.query.userAdres2;
  var userType = req.query.userType == undefined ? "" : req.query.userType;
  // var searchType4 = req.query.searchType4 == undefined ? "" : req.query.searchType4;
  var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
  var sql = "select * from user where uid <= 10000";
  var param = [];
  if (userPosition != '') {
    sql += " and userPosition = '" + userPosition + "' \n";
  }
  if (userAdres2 != '') {
    sql += " and userAdres2 like '" + userAdres2 + "' \n";
  }
  if (userType != '') {
    sql += " and userType = '" + userType + "' \n";
  }
  // if (searchType4 != '') {
  //   sql += " and userRole = '" + searchType4 + "' \n";
  // }
  if (searchText != '') {
    sql += " and (userName like '%" + searchText + "%' or hosName like '%" + searchText + "%')";
  }
  if(req.query.page != 'null') {
    sql += " order by userRank is null, userRank asc limit 15 offset ?;"
    param = page * 15;
  } else {
    sql += " order by userRank is null, userRank asc;";
  }
  try {
    connection.query(sql, param, function (err, results) {
      if (err) {
        console.log(err);
      }
      res.json(
        results
      );
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//푸시토큰, os종류 업데이트
router.post('/infoUpdate', async (req, res) => {
  const sql = "update user set oneSignalId = ?, userSocialDiv = ? where uid = ?";
  const param = [req.body.oneSignalId, req.body.userSocialDiv, req.body.uid];
  try {
    connection.query(sql, param, function (err, results) {
      if (err) {
        console.log(err);
      }
      res.json({
        msg: "success"
      });
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//지도 
router.get('/map', async (req, res) => {
  try {
    let user;
    connection.query('select * from user where uid <= 10000 order by userRank is null, userRank asc;', (err, results, fields) => {
      if (err) {
        console.log(err);
      }
      user = results;
      res.status(200).json(user);
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

module.exports = router;