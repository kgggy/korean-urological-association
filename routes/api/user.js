var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const connt = require("../../config/db")
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const crypto = require('crypto');

const multer = require("multer");
const path = require('path');
const fs = require('fs');


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
        //텍스트 파일이면
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

// 회원가입
router.post('/', async (req, res) => {
  const {
    userEmail,
    userNick,
    userSocialDiv,
    userToken,
    userAgree
  } = req.body;

  const sameEmailUser = await models.user.findOne({
    where: {
      userEmail
    }
  });
  if (sameEmailUser !== null) {
    return res.json({
      registerSuccess: false,
      message: "이미 존재하는 이메일입니다",
    });
  }

  const sameNickNameUser = await models.user.findOne({
    where: {
      userNick
    }
  });
  if (sameNickNameUser !== null) {
    return res.json({
      registerSuccess: false,
      message: "이미 존재하는 닉네임입니다.",
    });
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

  await models.user.create({
    userPwd,
    salt,
    userEmail,
    userNick,
    userSocialDiv,
    userToken,
    userAgree
  })
  res.json({
    msg: "sign up success"
  });
});


// 회원 상세보기
router.get('/:uid', async (req, res) => {
  try {
    const param = req.params.uid;
    let user;
    connection.query('select * from user where uid = ?', param, (err, results, fields) => {
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

// 회원정보수정
router.patch('/', upload.single('file'), async (req, res) => {
  var param;
  var pathe = "";
  var orgpathe = req.body.userImg;

  const {
    userNick,
    uid,
    userImg
  } = req.body;

  console.log(uid);
  console.log(userImg);

  const sameNickNameUser = await models.user.findOne({
    where: {
      userNick,
      uid: {
        [Op.notIn]: [uid],
      },
    }
  });

  if (sameNickNameUser !== null) {
    return res.json({
      registerSuccess: false,
      message: "이미 존재하는 닉네임입니다.",
    });
  }

  if (req.file != null) {
    pathe = req.file.path;
    param = [req.body.userNick, req.body.userAge, req.body.userSchool, req.body.userAdres1, req.body.userAdres2, pathe, req.body.uid];
  } else {
    param = [req.body.userNick, req.body.userAge, req.body.userSchool, req.body.userAdres1, req.body.userAdres2, req.body.userImg, req.body.uid];
  }

  const sql = "update user set userNick = ?,  userAge = ?, userSchool = ?,userAdres1 = ?, userAdres2 = ?, userImg = ? where uid = ?";
  connection.query(sql, param, (err) => {
    if (err) {
      console.error(err);
    }
    if (req.file != null) {
      fs.unlinkSync(orgpathe, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    return res.json({
      msg: "success"
    });
  });
});

//패스워드 변경
router.post('/pwdUpdate/:uid', async (req, res) => {
  const uid = req.params.uid;
  const userPwd = req.body.userPwd;

  const makePasswordHashed = (plainPassword) =>
    new Promise(async (resolve, reject) => {
      // salt를 가져오는 부분은 각자의 DB에 따라 수정
      const salt = await models.user
        .findOne({
          attributes: ['salt'],
          raw: true,
          where: {
            uid: uid,
          },
        }).then((result) => result.salt);

      crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve(key.toString('base64'));
      });
    });

  const password = await makePasswordHashed(userPwd);
  console.log(`password: ${password}`);

  const dbPwd = await models.user.findOne({
    attributes: ['userPwd'],
    where: {
      uid: uid
    }
  });
  console.log(`dbPwd: ${dbPwd.userPwd}`);
  if (password == dbPwd.userPwd) { // dbPwd: ['userPwd'] 해도 됨
    res.json({
      isSamePreviousPwd: true,
      msg: "기존 비밀번호와 다르게 입력해주세요."
    });
    // console.log(password);
    // console.log(dbPwd);
  } else {
    models.user.update({
      userPwd: password
    }, {
      where: {
        uid: uid
      }
    });
    res.json({
      pwdUpdate: true,
      msg: "패스워드 변경 완료"
    });
  }
});

//   models.user.update({
//     userPwd: password
//   }, { where: { uid: uid } });
//   res.json({
//     pwdUpdate: true,
//     message: "패스워드 변경 완료"
//   })
// });


// 회원 삭제
router.delete('/:uid', (req, res) => {
  const param = req.params.uid;
  const route = req.query.userImg;
  // console.log(param);
  const sql = "delete from user where uid = ?";
  connection.query(sql, param, (err) => {
    if (err) {
      console.log(err)
    }
    if (route != '') {
      fs.unlinkSync(route, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      })
    }
    res.json({
      msg: "success"
    });
  });
});

//다른회원정보 상세조회
router.get('/all/:uid', async (req, res) => {
  try {
    const param = req.params.uid;
    let user;
    connection.query('select userNick, userImg from user where uid = ?', param, (err, results) => {
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



module.exports = router;