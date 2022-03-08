var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
const crypto = require('crypto');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//등록 페이지 이동
router.get('/join', async (req, res) => {
    let route = req.app.get('views') + '/m_company/com_signUp.ejs';
    console.log(route);
    res.render(route);
});

//기업 회원등록
router.post('/companyEnroll', async (req, res) => {
    const {
        comNick,
        comName,
        comNum,
        comAdres1,
        comAdres2,
        comPresiName,
        comManagerName,
        comPhoneNum,
        comEmail,
        comAgree
    } = req.body;

    const sameNickNameCompany = await models.company.findOne({
        where: {
            comNick
        }
    });
    if (sameNickNameCompany !== null) {
        return res.send('<script>alert("이미 존재하는 닉네임입니다."); history.go(-1);</script>');
    }

    const createSalt = () =>
        new Promise((resolve, reject) => {
            crypto.randomBytes(64, (err, buf) => {
                if (err) reject(err);
                resolve(buf.toString('base64'));
            });
        });

    const createHashedPassword = (plainPassword) =>
        new Promise(async (resolve, reject) => {
            const salt = await createSalt();
            crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
                if (err) reject(err);
                resolve({
                    comPwd: key.toString('base64'),
                    salt
                });
            });
        });

    const {
        comPwd,
        salt
    } = await createHashedPassword(req.body.comPwd);

    await models.company.create({
        comPwd,
        salt,
        comNick,
        comName,
        comNum,
        comAdres1,
        comAdres2,
        comPresiName,
        comManagerName,
        comPhoneNum,
        comEmail,
        comAgree
    });

    res.send('<script>alert("회원 등록이 완료되었습니다. 관리자 검토 후 승인처리됩니다."); location.href="/admin";</script>');
});

//기업사용자 전체조회
router.get('/page', async (req, res) => {
    var page = req.query.page;
    var searchType1 = req.query.searchType1 == undefined ? "" : req.query.searchType1;
    var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
    var keepSearch = "&searchType1=" + searchType1 +
                     "&searchText=" + searchText;
  
    var sql = "select * from company where 1=1";
  
    if (searchType1 != '') {
      sql += " and comAgree = '" + searchType1 + "' \n";
    }
    if (searchText != '') {
      sql += " and (comEmail like '%" + searchText + "%' or comNick like '%" + searchText + "%' or comName like '%" + searchText + "%') order by uid";
    }
    try {
      connection.query(sql, function (err, results) {
        var last = Math.ceil((results.length) / 15);
        if (err) {
          console.log(err);
        }
        let route = req.app.get('views') + '/m_company/m_comUser';
        res.render(route, {
          searchType1: searchType1,
          searchText: searchText,
          results: results,
          page: page, //현재 페이지
          length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
          page_num: 15, //한 페이지에 보여줄 개수
          pass: true,
          last: last, //마지막 장
          keepSearch: keepSearch
        });
      });
    } catch (error) {
      res.status(401).send(error.message);
    }
  });

  //기업 사용자 상세조회
router.get('/selectOne', async (req, res) => {
    try {
      const param = req.query.comId;
      const sql = "select * from company where comId = ?";
      connection.query(sql, param, function (err, result) {
        if (err) {
          console.log(err);
        }
        let route = req.app.get('views') + '/m_company/com_viewForm';
        res.render(route, {
            result : result
        });
      });
  
    } catch (error) {
      res.status(401).send(error.message);
    }
  });

module.exports = router;