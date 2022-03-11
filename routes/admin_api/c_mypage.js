var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
// const crypto = require('crypto');
// const models = require('../../models');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//기업 사용자 상세조회
router.get('/selectOne', async (req, res) => {
  try {
    const param = req.session.user.comId;
    const sql = "select * from company where comId = ?";
    connection.query(sql, param, function (err, result) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') + '/c_mypage/com_viewForm';
      res.render(route, {
        result: result
      });
    });

  } catch (error) {
    res.status(401).send("<script>alert('로그인이 필요합니다.');location.href='/admin'</script>");
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


module.exports = router;