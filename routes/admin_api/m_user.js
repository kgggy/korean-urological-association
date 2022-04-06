var express = require('express');
var router = express.Router();
const fs = require('fs');

const multer = require("multer");
const path = require('path');
const crypto = require('crypto');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
//엑셀파일 생성
var nodeExcel = require('excel-export');
// DB 커넥션 생성                
var connection = require('../../config/db').conn;

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

//사용자 전체조회
router.get('/page', async (req, res) => {
  var page = req.query.page;
  var searchType1 = req.query.searchType1 == undefined ? "" : req.query.searchType1;
  var searchType2 = req.query.searchType2 == undefined ? "" : req.query.searchType2;
  var searchType3 = req.query.searchType3 == undefined ? "" : req.query.searchType3;
  var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
  var keepSearch = "&searchType1=" + searchType1 +
    "&searchType2=" + searchType2 + "&searchType3=" + searchType3 + "&searchText=" + searchText;

  var sql = "select * from user where 1=1";

  if (searchType1 != '') {
    sql += " and userAdres2 = '" + searchType1 + "' \n";
  }
  if (searchType2 != '') {
    sql += " and userType = '" + searchType2 + "' \n";
  }
  if (searchType3 != '') {
    sql += " and userPosition = '" + searchType3 + "' \n";
  }
  if (searchText != '') {
    sql += " and (hosName like '%" + searchText + "%' or userName like '%" + searchText + "%') order by uid";
  }
  try {
    connection.query(sql, function (err, results) {
      var last = Math.ceil((results.length) / 15);
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') + '/m_user/m_user';
      res.render(route, {
        searchType1: searchType1,
        searchType2: searchType2,
        searchType3: searchType3,
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

//사용자 상세조회
router.get('/selectOne', async (req, res) => {
  try {
    var searchType1 = req.query.searchType1 == undefined ? "" : req.query.searchType1;
    var searchType2 = req.query.searchType2 == undefined ? "" : req.query.searchType2;
    var searchType3 = req.query.searchType3 == undefined ? "" : req.query.searchType3;
    var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
    var keepSearch = "&searchType1=" + searchType1 +
      "&searchType2=" + searchType2 + "&searchType3=" + searchType3 + "&searchText=" + searchText;
    var page = req.query.page;
    const param = [req.query.uid, req.query.uid, req.query.uid];
    const sql = "select * from user where uid = ?";
    connection.query(sql, param, function (err, result) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') + '/m_user/orgm_viewForm';
      res.render(route, {
        result: result,
        page: page,
        searchType1: searchType1,
        searchType2: searchType2,
        searchType3: searchType3,
        searchText: searchText,
        keepSearch: keepSearch
      });
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 등록 페이지 이동
router.get('/userInsertForm', (req, res) => {
  let route = req.app.get('views') + '/m_user/orgm_writForm';
  res.render(route);
});

//사용자 등록
router.post('/userInsert', upload.single('file'), async (req, res) => {
  console.log(req.body)
  const {
    file,
    userName,
    hosName,
    hosPost,
    userAdres1,
    userAdres2,
    userAdres3,
    hosPhone1,
    hosPhone2,
    hosPhone3,
    userType,
    userPosition,
    pushYn
  } = req.body;

  if (req.file != null) {
    const userImg = req.file.path;
    await models.user.create({
      userImg,
      userName,
      hosName,
      hosPost,
      userAdres1,
      userAdres2,
      userAdres3,
      hosPhone1,
      hosPhone2,
      hosPhone3,
      userType,
      userPosition,
      pushYn
    });
  } else {
    await models.user.create({
      userName,
      hosName,
      hosPost,
      userAdres1,
      userAdres2,
      userAdres3,
      hosPhone1,
      hosPhone2,
      hosPhone3,
      userType,
      userPosition,
      pushYn
    });
  }
  res.send('<script>alert("회원 등록이 완료되었습니다."); location.href="/admin/m_user/page?page=1";</script>');
});

//사용자 정보 수정 페이지 이동
router.post('/userUdtForm', async (req, res) => {
  let route = req.app.get('views') + '/m_user/orgm_udtForm';
  res.render(route, {
    result: req.body,
    page: req.body.page
  });
});

//사용자 정보 수정
router.post('/userUpdate', upload.single('file'), async (req, res) => {
  var path = "";
  var param = "";
  if (req.file != null) {
    path = req.file.path;
    param = [path, req.body.userName, req.body.hosName,
      req.body.hosPost, req.body.userAdres1, req.body.userAdres2, req.body.userAdres3,
      req.body.hosPhone1, req.body.hosPhone2, req.body.hosPhone3,
      req.body.userType, req.body.userPosition, req.body.uid
    ];
  } else {
    param = [req.body.userImg, req.body.userName, req.body.hosName,
      req.body.hosPost, req.body.userAdres1, req.body.userAdres2, req.body.userAdres3,
      req.body.hosPhone1, req.body.hosPhone2, req.body.hosPhone3,
      req.body.userType, req.body.userPosition, req.body.uid
    ];
  }
  const sql = "update user set userImg = ?, userName = ?, hosName = ?, hosPost = ?, userAdres1 = ?, userAdres2 = ?, \
                               userAdres3 = ?, hosPhone1 = ?, hosPhone2 = ?, hosPhone3 = ?, userType = ? , userPosition = ?\
                where uid = ?";
  connection.query(sql, param, (err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('selectOne?uid=' + req.body.uid + '&page=' + req.body.page);
  });
});

//사용자 여러명 삭제
router.get('/userDelete', (req, res) => {
  const param = req.query.uid;
  const route = req.query.userImg;
  // console.log(param)
  // console.log(route);
  const str = param.split(',');
  const img = route.split(',');
  // console.log(str);
  // console.log(img);
  // DB 글삭제
  for (var i = 0; i < str.length; i++) {
    const sql = "delete from user where uid = ?";
    connection.query(sql, str[i], (err) => {
      if (err) {
        console.log(err)
      }
    });
  }
  //서버에서 프로필 이미지 삭제
  for (var i = 0; i < img.length; i++) {
    if (img[i] !== '') {
      console.log("프로필 이미지 존재함.")
      fs.unlinkSync(img[i], (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
    } else {
      console.log("프로필 이미지 존재하지않음.")
    }
  }
  // for (var i = 0; i < img.length; i++) {
  //   // console.log(img[i] + "if문 밖의 콘솔");
  //   if (img[i] !== '' || img[i] !== undefined || img[i] !== null) {
  //     // console.log(img[i] + "if문 안의 콘솔");
  //     fs.unlinkSync(img[i], (err) => {
  //       if (err) {
  //         console.log(err);
  //       }
  //       return;
  //     });
  //   }
  // }
  res.send('<script>alert("삭제되었습니다."); location.href="/admin/m_user/page?page=1";</script>');
});

//사용자 한명 삭제
router.get('/oneUserDelete', (req, res) => {
  const param = req.query.uid;
  const route = req.query.userImg;
  const sql = "delete from user where uid = ?";
  connection.query(sql, param, (err, row) => {
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
  });
  res.send('<script>alert("삭제되었습니다."); location.href="/admin/m_user/page?page=1";</script>');
});

//프로필 삭제
router.get('/imgDelete', async (req, res) => {
  const param = req.query.userImg;
  try {
    const sql = "update user set userImg = null where uid = ?";
    connection.query(sql, req.query.uid, (err) => {
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
  let route = req.app.get('views') + '/m_user/orgm_udtForm';
  res.render(route, {
    result: req.query
  });
});

//엑셀 다운로드
router.get('/userExcel', async (req, res) => {
  var searchType1 = req.query.searchType1 == undefined ? "" : req.query.searchType1;
  var searchType2 = req.query.searchType2 == undefined ? "" : req.query.searchType2;
  var searchType3 = req.query.searchType3 == undefined ? "" : req.query.searchType3;
  var searchType4 = req.query.searchType4 == undefined ? "" : req.query.searchType4;
  var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
  var conf = {};

  conf.cols = [{
      caption: '번호',
      type: 'number',
      width: 8
    }, {
      caption: '이메일',
      captionStyleIndex: 1,
      type: 'string',
      width: 50
    }, {
      caption: '닉네임',
      captionStyleIndex: 1,
      type: 'string',
      width: 30
    }, {
      caption: '나이',
      captionStyleIndex: 1,
      type: 'number',
      width: 8
    },
    {
      caption: '주소',
      captionStyleIndex: 1,
      type: 'string',
      width: 30
    },
    {
      caption: '학교',
      captionStyleIndex: 1,
      type: 'string',
      width: 15
    }, {
      caption: '포인트',
      captionStyleIndex: 1,
      type: 'number',
      width: 15
    }, {
      caption: '계산점수',
      captionStyleIndex: 1,
      type: 'number',
      width: 12
    }, {
      caption: '나무등급',
      captionStyleIndex: 1,
      type: 'string',
      width: 12
    },
    {
      caption: '작성한 게시글 수',
      captionStyleIndex: 1,
      type: 'string',
      width: 12
    },
    {
      caption: '가입일',
      captionStyleIndex: 1,
      type: 'string',
      width: 12
    },
    {
      caption: '로그인 경로',
      captionStyleIndex: 1,
      type: 'string',
      width: 12
    },
    {
      caption: '권한',
      captionStyleIndex: 1,
      type: 'string',
      width: 12
    }, {
      caption: '상태',
      captionStyleIndex: 1,
      type: 'string',
      width: 12
    },
    {
      caption: '개인정보 동의여부',
      captionStyleIndex: 1,
      type: 'string',
      width: 12
    }
  ];

  var sql = "select *,\
                    date_format(userRegDate, '%Y-%m-%d') as userRegDatefmt,\
                    case when userStatus = '0' then '활동중' when userStatus = '1' then '탈퇴' end as userStatusfmt,\
                    case when userSocialDiv = 'b' then '일반 가입' when userSocialDiv = 'A' then '소셜로그인(애플)' when userSocialDiv = 'G' then '소셜로그인(구글)' when userSocialDiv = 'N' then '소셜로그인(네이버)' end as userSocialDivfmt,\
                    case when userAgree = '0' then '동의' else '비동의' end as userAgreefmt\
              from user\
             where 1=1";

  if (searchType1 != '') {
    sql += " and userStatus = '" + searchType1 + "' \n";
  }
  if (searchType2 != '') {
    sql += " and userAgree = '" + searchType2 + "' \n";
  }
  if (searchType3 != '' && searchType3 == '61') {
    sql += " and userAge >= 60 \n";
  } else if (searchType3 != '' && searchType3 == '20') {
    sql += " and  userAge <> 0 and userAge <= 20 \n";
  } else if (searchType3 != '' && searchType3 == '30' || searchType3 == '40' || searchType3 == '50' || searchType3 == '60')
    sql += " and userAge between " + searchType3 + "-10 and " + searchType3 + " \n";
  if (searchType4 != '') {
    sql += " and userTree = '" + searchType4 + "' \n";
  }
  if (searchText != '') {
    sql += " and (userNick like '%" + searchText + "%' or userEmail like '%" + searchText + "%' or userSchool like '%" + searchText + "%') order by uid";
  }

  try {
    connection.query(sql, function (err, results) {
      if (err) {
        console.log(err);
      }
      var arr = [];
      for (var i = 0; i < results.length; i++) {
        var resultData = [
          results[i].uid,
          results[i].userEmail,
          results[i].userNick,
          results[i].userAge,
          results[i].userAdres1 + ' ' + results[i].userAdres2,
          results[i].userSchool,
          results[i].userPoint,
          results[i].userScore,
          results[i].userTree,
          results[i].countAll,
          results[i].userRegDatefmt,
          results[i].userSocialDivfmt,
          results[i].userStatusfmt,
          results[i].userAgreefmt
        ];
        arr.push(resultData);
      }
      conf.rows = arr;
      var result = nodeExcel.execute(conf);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats');
      res.setHeader("Content-Disposition", "attachment; filename=" + "ecoce_user.xlsx");
      res.end(result, 'binary');
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

module.exports = router;