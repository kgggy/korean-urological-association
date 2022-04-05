var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;

// 전체 회원 목록
router.get('/all', async (req, res) => {
  try {
    let user;
    connection.query('select * from user', (err, results, fields) => {
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

//회원 검색
router.get('/search', async (req, res) => {
  var searchType1 = req.query.searchType1 == undefined ? "" : req.query.searchType1;
  var searchType2 = req.query.searchType2 == undefined ? "" : req.query.searchType2;
  var searchType3 = req.query.searchType3 == undefined ? "" : req.query.searchType3;
  // var searchType4 = req.query.searchType4 == undefined ? "" : req.query.searchType4;
  // var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
  var sql = "select * from user where 1=1";

  if (searchType1 != '') {
    sql += " and userPosition = '" + searchType1 + "' \n";
  }
  if (searchType2 != '') {
    sql += " and userAdres1 like '%" + searchType2 + "%' \n";
  }
  if (searchType3 != '') {
    sql += " and userType = '" + searchType3 + "' \n";
  }
  // if (searchType4 != '') {
  //   sql += " and userRole = '" + searchType4 + "' \n";
  // }
  // if (searchText != '') {
  //   sql += " and (userNick like '%" + searchText + "%' or userEmail like '%" + searchText + "%' or userSchool like '%" + searchText + "%') order by uid";
  // }
  // console.log(sql);
  try {
    connection.query(sql, function (err, results) {
      if (err) {
        console.log(err);
      }
      res.json(
        // searchType1: searchType1,
        // searchType2: searchType2,
        // searchType3: searchType3,
        // searchType4: searchType4,
        // searchText: searchText,
        results
      );
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

module.exports = router;