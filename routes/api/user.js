var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;
var models = require('../../models');

// 전체 회원 목록
router.get('/all', async (req, res) => {
    try {
      // console.log("현재버전!!!!!!!!!!!!!!!!")
      const page = parseInt(req.query.page);
      const uid = req.query.uid;
      let user;

      var sql = "";
      var param = [];
      if (req.query.page != 'null') {
        sql = "select u.*, p.psd from user u\
            left join president p on p.uid = u.uid \
             order by field(u.uid, ?) desc, u.userRank is null, u.userRank asc limit 15 offset ?";
        param = [uid, page * 15];
      } else {
        sql = "select u.*, p.psd from user u left join president p on p.uid = u.uid order by field(u.uid, ?) desc, u.userRank is null, u.userRank asc";
        param = [uid]
      }
      connection.query(sql, param, async (err, results, fields) => {
        if (err) {
          console.log(err);
        }
        user = results;
        //병원파일 가져오기
        var hosImgs;
        for (i = 0; i < user.length; i++) {
          hosImgs = await models.file.findAll({
            where: {
              uid: user[i].uid
            },
            attributes: ["fileRoute", "fileOrgName", "fileType"],
            raw: true
          })
          // console.log(hosImgs)
          user[i]['hosImgs'] = hosImgs;
        }
        res.status(200).json({
          user: user
        });
      });
    } catch (error) {
      res.status(401).send(error.message);
    }
});

//회원 검색 드롭다운
router.get('/dropdown', async (req, res) => {
  let userPosition;
  let userAdres2;
  let userType;
  try {
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
            userPosition: userPosition,
            userAdres2: userAdres2,
            userType: userType
          });
        })
      });
    });
  } catch (error) {
    res.status(401).send(error.message);
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

  var choDiv = 'N';

  var sql = "select * from user where uid";
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
  if (choDiv == 'Y') {
    sql += " and (choSearch(userName) LIKE '%" + searchText + "%' COLLATE utf8mb4_0900_ai_ci OR userName LIKE '%" + searchText + "%' OR\
              choSearch(hosName) LIKE '%" + searchText + "%' COLLATE utf8mb4_0900_ai_ci OR hosName LIKE '%" + searchText + "%')";
  
  } else if(choDiv == 'N'){
    sql += " and (userName like '%" + searchText + "%' or hosName like '%" + searchText + "%'\
              or concat(userPhone1,userPhone2,userPhone3) like '%"+ searchText +"%' or concat(hosPhone1,hosPhone2,hosPhone3) like '%"+ searchText+"%')";
  }
}

  if (req.query.page != 'null') {
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
    connection.query('select latitude, longitude, hosName from user where uid <= 10000;', (err, results, fields) => {
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