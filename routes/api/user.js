var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;
var models = require('../../models');

// 전체 회원 목록
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const uid = req.query.uid;
    let user;

    var sql = "";
    var param = [];
    if (req.query.page != 'null') {
      sql = "select u.*, p.psd from user u \
            left join president p on p.uid = u.uid where u.uid <= 10000\
             order by field(u.uid, ?) desc, u.userRank is null, u.userRank asc, u.userName limit 15 offset ?";
      param = [uid, page * 15];
    } else {
      sql = "select u.*, p.psd from user u left join president p on p.uid = u.uid where u.uid <= 10000 order by field(u.uid, ?) desc, u.userRank is null, u.userRank asc, u.userName asc";
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
        // (function (i) {
          hosImgs = await models.file.findAll({
            where: {
              uid: user[i].uid
            },
            attributes: ["fileRoute", "fileOrgName", "fileType"],
            raw: true
          })
          user[i]['hosImgs'] = await hosImgs
        // })(i);
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
  var map = req.query.map == undefined ? "" : req.query.map;
  // var searchType4 = req.query.searchType4 == undefined ? "" : req.query.searchType4;
  var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
  let user;
  var choDiv;
  cho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  result = "";

  var sql = "select * from user where uid <= 10000";
  var param = [];
  if (userPosition != '') {
    sql += " and userPosition = '" + userPosition + "' \n";
  }
  // console.log(userAdres2)
  if (userAdres2 != '') {
    sql += " and userAdres2 like '" + userAdres2 + "' \n";
  }
  if (userType != '') {
    sql += " and userType = '" + userType + "' \n";
  }

  if (req.query.page != 'null') {
    //회원검색
    if (searchText != '') {
      // 검색어가 숫자인지 초성인지 아닌지를 유니코드를 통해 구분
      for (i = 0; i < searchText.length; i++) {
        code = searchText.charCodeAt(i);
        if (code > 12592 && code < 12623) {
          choDiv = "Y";
        };
        // 초성일 경우 DB에 있는 function을 호출하여 DB의 저장된 이름을 초성으로 변경후
        // like 연산자로 비교
        if (choDiv == "Y") {
          sql += " and (choSearch(userName) LIKE '%" + searchText + "%' COLLATE utf8mb4_0900_ai_ci OR userName LIKE '%" + searchText + "%' OR\
                  choSearch(hosName) LIKE '%" + searchText + "%' COLLATE utf8mb4_0900_ai_ci OR hosName LIKE '%" + searchText + "%')";
          // 초성이 아닐 경우 번호또는 글자이니 일반 검색과 번호 검색 
        } else {
          sql += " and (userName like '%" + searchText + "%' or hosName like '%" + searchText + "%'\
                  or concat(userPhone1,userPhone2,userPhone3) like '%" + searchText + "%' or concat(hosPhone1,hosPhone2,hosPhone3) like '%" + searchText + "%')";
        }
      }
      if (choDiv == "Y") {
        sql += " order by case when choSearch(userName) like '%" + searchText + "%' COLLATE utf8mb4_0900_ai_ci then 1 when choSearch(hosName) LIKE '%" + searchText + "%' COLLATE utf8mb4_0900_ai_ci then 2 end, userName asc limit 15 offset ?;";
        param = page * 15;
      } else if (choDiv == undefined) {
        sql += " order by case when userName like '%" + searchText + "%' COLLATE utf8mb4_0900_ai_ci then 1 when hosName LIKE '%" + searchText + "%' COLLATE utf8mb4_0900_ai_ci then 2 end, userName asc limit 15 offset ?;";
        param = page * 15;
      }
    } else {
      //검색어가 존재하지 않음
      sql += " order by userName asc limit 15 offset ?;"
      param = page * 15;
    }
  } else {
    //지도검색(병원검색)
    if (searchText != '') {
      // 검색어가 숫자인지 초성인지 아닌지를 유니코드를 통해 구분
      for (i = 0; i < searchText.length; i++) {
        code = searchText.charCodeAt(i);
        if (code > 12592 && code < 12623) {
          choDiv = "Y";
        };
        // 초성일 경우 DB에 있는 function을 호출하여 DB의 저장된 이름을 초성으로 변경후
        // like 연산자로 비교
        if (choDiv == "Y") {
          sql += " and choSearch(hosName) LIKE '%" + searchText + "%' COLLATE utf8mb4_0900_ai_ci OR hosName LIKE '%" + searchText + "%'";
          // 초성이 아닐 경우 번호또는 글자이니 일반 검색과 번호 검색 
        } else {
          sql += " and hosName like '%" + searchText + "%'";
        }
      }
      //페이지가 존재하지않을때(지도검색)
    } else {
      sql += " order by userName asc;";
    }
  }

  //검색어가 존재함.
  // console.log("sql ============================== " + sql)
  try {
    connection.query(sql, param, async (err, results) => {
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
        // }).then(user[i]['hosImgs'] = hosImgs)
      })
      user[i]['hosImgs'] = await hosImgs
        // console.log(hosImgs)
      }
      // console.log(user)
      res.status(200).send(user);
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