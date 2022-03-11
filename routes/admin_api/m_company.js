var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
const crypto = require('crypto');
const models = require('../../models');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//등록 페이지 이동
router.get('/join', async (req, res) => {
  let route = req.app.get('views') + '/m_company/com_writForm.ejs';
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

  res.send('<script>alert("회원 등록이 완료되었습니다."); location.href="/admin/m_company/page?page=1";</script>');
});

//기업사용자 전체조회
router.get('/page', async (req, res) => {
  var page = req.query.page;
  var sql = "select * from company";
  try {
    connection.query(sql, function (err, results) {
      var last = Math.ceil((results.length) / 15);
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') + '/m_company/m_comUser';
      res.render(route, {
        results: results,
        page: page, //현재 페이지
        length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
        page_num: 15, //한 페이지에 보여줄 개수
        pass: true,
        last: last
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
        result: result
      });
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//기업 사용자 수정 페이지로 이동
router.get('/comUserUdtForm', async (req, res) => {
  try {
    const param = [req.query];
    let route = req.app.get('views') + '/m_company/com_udtForm';
    res.render(route, {
      result: param
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//기업 사용자 수정
router.post('/comUserUpdate', async (req, res) => {
  try {
    const param = [req.body.comNick, req.body.comName, req.body.comNum, req.body.comAdres1, req.body.comAdres2, req.body.comPresiName, req.body.comManagerName, req.body.comPhoneNum, req.body.comEmail, req.body.comId];
    const sql = "update company set comNick = ?, comName = ?, comNum = ?, comAdres1 = ?, comAdres2 = ?, comPresiName = ?, \
                                    comManagerName = ?, comPhoneNum = ?, comEmail = ? \
                  where comId = ?";
    connection.query(sql, param, (err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('selectOne?comId=' + req.body.comId);
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 여러명 삭제
router.get('/comUsersDelete', (req, res) => {
  const param = req.query.comId;
  const str = param.split(',');
  for (var i = 0; i < str.length; i++) {
    const sql = "delete from company where comId = ?";
    connection.query(sql, str[i], (err) => {
      if (err) {
        console.log(err)
      }
    });
  }
  res.redirect('page?page=1');
});

module.exports = router;