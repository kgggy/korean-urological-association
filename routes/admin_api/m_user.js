var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const fs = require('fs');

const multer = require("multer");
const path = require('path');

const connt = require("../../config/db")
var url = require('url');
const crypto = require('crypto');
const {
  type
} = require('os');
const conn = require('../../config/db');
const {
  REPL_MODE_SLOPPY
} = require('repl');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();


//파일업로드 모듈
var upload = multer({ //multer안에 storage정보  
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      //파일이 이미지 파일이면
      if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "application/octet-stream") {
        // console.log("이미지 파일입니다.");
        callback(null, 'uploads/userProfile');
      }
    },
    //파일이름 설정
    filename: (req, file, done) => {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  //파일 개수, 파일사이즈 제한
  limits: {
    files: 5,
    fileSize: 1024 * 1024 * 1024 //1기가
  },

});

//로그인 페이지
router.get('/login', async (req, res) => {
  console.log("==============================");
  let route = req.app.get('views') + '/index';
  res.render(route, {
    layout: false
  });
})

//로그인
router.post('/', async (req, res) => {

  const {
    userPwd,
    userEmail
  } = req.body;


  const emailChk = await models.user.findOne({
    where: {
      userEmail
    }
  });

  if (emailChk == null) {
    return res.json({
      emailChk: false,
      message: "이메일을 다시 확인해주세요.",
    });
  }

  const makePasswordHashed = (userEmail, plainPassword) =>
    new Promise(async (resolve, reject) => {
      // salt를 가져오는 부분은 각자의 DB에 따라 수정
      const salt = await models.user
        .findOne({
          attributes: ['salt'],
          raw: true,
          where: {
            userEmail,
          },
        }).then((result) => result.salt);
      console.log(salt);

      crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve(key.toString('base64'));
      });
    });

  const password = await makePasswordHashed(userEmail, userPwd);
  const dbPwd = await models.user.findOne({
    where: {
      userEmail
    }
  });
  console.log(dbPwd);
  if (password == dbPwd.userPwd) { // dbPwd: ['userPwd'] 해도 됨
    res.json(
      dbPwd
    );

  } else {
    res.json({
      pwdChk: false,
      message: "비밀번호를 확인해주세요.",
    });
  }
});

//사용자 전체조회
router.get('/', async (req, res) => {
  try {
    const sql = "select * from user where userAuth = 0 or userAuth = 1";
    connection.query(sql, function (err, results, fields) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') + '/m_user/m_user';
      res.render(route, {
        'results': results
      });
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//페이징
router.get('/page', async (req, res) => {
  // let pageNum = req.query.page; // 요청 페이지 넘버
  // let offset = 0; //몇번째부터 조회할건지

  // if (pageNum > 1) {
  //   offset = 10 * (pageNum - 1);
  // }

  // models.user.findAll({
  //   // pagination
  //   offset: offset,
  //   limit: 7 //조회할 개수
  // })
  try {
    var page = req.query.page;
    const sql = "select * from user where userAuth = 0";
    connection.query(sql, function (err, results, fields) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') + '/m_user/m_user';
      res.render(route, {
        results: results,
        page: page, //현재 페이지
        length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
        page_num: 10, //한 페이지에 보여줄 개수
        pass: true
      });
      // console.log(results);
      console.log(results.length-1 + "================");
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 상세조회
router.get('/selectOne', async (req, res) => {
  try {
    const param = [req.query.uid, req.query.uid, req.query.uid];
    const sql = "select *, ((select count(*) from certiContent where uid = ?) +\
                           (select count(*) from post where uid = ?)) as contentAll, abs(u.userScore - t.treeScore) as score\
                   from user u join tree t on 1=1 where uid = ?\
                   order by score limit 1";
    connection.query(sql, param, function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') + '/m_user/orgm_viewForm';
      res.render(route, {
        'result': result,
        layout: false
      });
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 등록 페이지 이동
router.get('/userInsertForm', (req, res) => {
  fs.readFile('views/ejs/m_user/orgm_writForm.ejs', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.end(data);
    }
  });
});

//사용자 등록
router.post('/userInsert', upload.single('file'), async (req, res) => {
  const {
    file,
    userNick,
    userEmail,
    userAge,
    userAdres1,
    userAdres2,
    userSchool,
    userPoint,
    userScore,
    userStatus,
    userAgree,
    userAuth
  } = req.body;

  const sameEmailUser = await models.user.findOne({
    where: {
      userEmail
    }
  });
  if (sameEmailUser !== null) {
    return res.send('<script>alert("이미 존재하는 이메일입니다."); history.go(-1);</script>');
  }

  const sameNickNameUser = await models.user.findOne({
    where: {
      userNick
    }
  });
  if (sameNickNameUser !== null) {
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
          userPwd: key.toString('base64'),
          salt
        });
      });
    });

  const {
    userPwd,
    salt
  } = await createHashedPassword(req.body.userPwd);

  if (req.file != null) {
    const userImg = req.file.path;
    await models.user.create({
      userPwd,
      salt,
      userImg,
      userNick,
      userEmail,
      userAge,
      userAdres1,
      userAdres2,
      userSchool,
      userPoint,
      userScore,
      userStatus,
      userAgree,
      userAuth
    });
  } else {
    await models.user.create({
      userPwd,
      salt,
      userNick,
      userEmail,
      userAge,
      userAdres1,
      userAdres2,
      userSchool,
      userPoint,
      userScore,
      userStatus,
      userAgree,
      userAuth
    });
  }

  res.send('<script>alert("회원 등록이 완료되었습니다."); opener.parent.location.reload(); window.close();</script>');
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
      let route = req.app.get('views') + '/m_user/orgm_udtForm';
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
router.post('/userUpdate', upload.single('file'), async (req, res) => {
  var path = "";
  var param = "";
  if (req.file != null) {
    path = req.file.path;
    param = [req.body.userNick, req.body.userEmail, req.body.userAge,
      req.body.userAdres1, req.body.userAdres2, path, req.body.userSchool,
      req.body.userPoint, req.body.userScore, req.body.userStatus,
      req.body.userAgree, req.body.userAuth, req.body.uid
    ];
  } else {
    param = [req.body.userNick, req.body.userEmail, req.body.userAge,
      req.body.userAdres1, req.body.userAdres2, req.body.userImg, req.body.userSchool,
      req.body.userPoint, req.body.userScore, req.body.userStatus,
      req.body.userAgree, req.body.userAuth, req.body.uid
    ];
  }
  const sql = "update user set userNick = ?, userEmail = ?, userAge = ?, userAdres1 = ?, userAdres2 = ?, userImg = ?, \
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

//프로필 삭제
router.get('/imgDelete', async (req, res) => {
  const param = req.query.userImg;
  try {
    const sql = "update user set userImg = null where uid = ?";
    connection.query(sql, req.query.uid, (err, row) => {
      if (err) {
        console.log(err)
      }
      fs.unlinkSync(param, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
    })
  } catch (error) {
    if (error.code == "ENOENT") {
      console.log("프로필 삭제 에러 발생");
    }
  }
  res.redirect('userUdtForm?uid=' + req.query.uid);
});

// 검색
router.get('/search', async (req, res) => {
  if (req.query.searchType == 'userEmail') {
    models.user.findAll({
      where: {
        userEmail: {
          [Op.like]: "%" + req.query.searchText + "%"
        },
      },
      order: [
        ['uid', 'ASC']
      ],
      raw: true,
    }).then(results => {
      console.log(results);
      let route = req.app.get('views') + '/m_user/m_user';
      res.render(route, {
        'results': results,
      });
    }).catch(err => {
      console.log(err);
      return res.status(404).json({
        message: 'error'
      });
    })
  } else {
    models.user.findAll({
      where: {
        userNick: {
          [Op.like]: "%" + req.query.searchText + "%"
        },
      },
      order: [
        ['uid', 'ASC']
      ],
      raw: true,
    }).then(results => {
      console.log(results);
      let route = req.app.get('views') + '/m_user/m_user';
      res.render(route, {
        'results': results
      });
    }).catch(err => {
      console.log(err);
      return res.status(404).json({
        message: 'error'
      });
    })
  }
});

module.exports = router;