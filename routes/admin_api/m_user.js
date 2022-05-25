var express = require('express');
var router = express.Router();
const fs = require('fs');
const multer = require("multer");
const sharp = require('sharp');
const path = require('path');
const models = require('../../models');
//엑셀파일 생성
var nodeExcel = require('excel-export');
// DB 커넥션 생성                
var connection = require('../../config/db').conn;

//파일업로드 모듈
var upload = multer({ //multer안에 storage정보  
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      fs.mkdir('uploads/userProfile', function (err) {
        if (err && err.code != 'EEXIST') {
          console.log("already exist")
        } else {
          callback(null, 'uploads/userProfile');
        }
      })
    },
    //파일이름 설정
    filename: (req, file, done) => {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
});

//일반 사용자 전체조회
router.get('/page', async (req, res) => {
  var page = req.query.page;
  var searchType1 = req.query.searchType1 == undefined ? "" : req.query.searchType1;
  var searchType2 = req.query.searchType2 == undefined ? "" : req.query.searchType2;
  var searchType3 = req.query.searchType3 == undefined ? "" : req.query.searchType3;
  var userSocialDiv = req.query.userSocialDiv == undefined ? "" : req.query.userSocialDiv;
  var userPay = req.query.userPay == undefined ? "" : req.query.userPay;
  var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
  var keepSearch = "&searchType1=" + searchType1 +
    "&searchType2=" + searchType2 + "&searchType3=" + searchType3 + "&userSocialDiv=" + userSocialDiv + "&userPay=" + userPay + "&searchText=" + searchText;

  var sql = "select * from user where uid <= 10000";

  if (searchType1 != '') {
    sql += " and userAdres2 = '" + searchType1 + "' \n";
  }
  if (searchType2 != '') {
    sql += " and userType = '" + searchType2 + "' \n";
  }
  if (searchType3 != '') {
    sql += " and userPosition = '" + searchType3 + "' \n";
  }
  if (userSocialDiv != '') {
    if (userSocialDiv == 'all') {
      sql += " and userSocialDiv != '' \n";
    } else {
      // console.log(userSocialDiv)
      sql += " and userSocialDiv = '" + userSocialDiv + "' \n";
    }
  }
  if (userPay != '') {
    sql += " and userPay = '" + userPay + "' \n";
  }
  if (searchText != '') {
    sql += " and (hosName like '%" + searchText + "%' or userName like '%" + searchText + "%')";
  }
  sql += " order by uid desc;"
  try {
    connection.query(sql, function (err, results) {
      var countPage = 10; //하단에 표시될 페이지 개수
      var page_num = 10; //한 페이지에 보여줄 개수
      var last = Math.ceil((results.length) / page_num); //마지막 장
      var endPage = Math.ceil(page / countPage) * countPage; //끝페이지(10)
      var startPage = endPage - countPage; //시작페이지(1)
      if (err) {
        console.log(err);
      }
      if (last < endPage) {
        endPage = last
      };
      let route = req.app.get('views') + '/m_user/m_user';
      res.render(route, {
        searchType1: searchType1,
        searchType2: searchType2,
        searchType3: searchType3,
        userSocialDiv: userSocialDiv,
        userPay: userPay,
        searchText: searchText,
        results: results,
        page: page, //현재 페이지
        length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
        page_num: page_num,
        countPage: countPage,
        startPage: startPage,
        endPage: endPage,
        pass: true,
        last: last,
        keepSearch: keepSearch,
        admin: ''
      });
      // console.log(last)
      // console.log("endPage = " + endPage)
      // console.log("page = " + page)
      // console.log("startPage = " + startPage)
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//개발자 사용자 전체조회
router.get('/admin', async (req, res) => {
  var page = req.query.page;
  var searchType1 = req.query.searchType1 == undefined ? "" : req.query.searchType1;
  var searchType2 = req.query.searchType2 == undefined ? "" : req.query.searchType2;
  var searchType3 = req.query.searchType3 == undefined ? "" : req.query.searchType3;
  var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
  var keepSearch = "&searchType1=" + searchType1 +
    "&searchType2=" + searchType2 + "&searchType3=" + searchType3 + "&searchText=" + searchText;

  var sql = "select * from user where uid >= 10000";

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
    sql += " and (userName like '%" + searchText + "%')";
  }
  sql += " order by uid desc;"
  try {
    connection.query(sql, function (err, results) {
      var countPage = 10; //하단에 표시될 페이지 개수
      var page_num = 10; //한 페이지에 보여줄 개수
      var last = Math.ceil((results.length) / page_num); //마지막 장
      var endPage = Math.ceil(page / countPage) * countPage; //끝페이지(10)
      var startPage = endPage - countPage; //시작페이지(1)
      if (err) {
        console.log(err);
      }

      if (last < endPage) {
        endPage = last
      };
      let route = req.app.get('views') + '/m_user/m_userAdmin';
      res.render(route, {
        searchType1: searchType1,
        searchType2: searchType2,
        searchType3: searchType3,
        searchText: searchText,
        results: results,
        page: page, //현재 페이지
        length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
        page_num: page_num,
        countPage: countPage,
        startPage: startPage,
        endPage: endPage,
        pass: true,
        last: last,
        keepSearch: keepSearch,
        admin: "admin"
      });
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 상세조회
router.get('/selectOne', async (req, res) => {
  try {
    const admin = req.query.admin;
    var searchType1 = req.query.searchType1 == undefined ? "" : req.query.searchType1;
    var searchType2 = req.query.searchType2 == undefined ? "" : req.query.searchType2;
    var searchType3 = req.query.searchType3 == undefined ? "" : req.query.searchType3;
    var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
    var keepSearch = "&searchType1=" + searchType1 +
      "&searchType2=" + searchType2 + "&searchType3=" + searchType3 + "&searchText=" + searchText;
    var page = req.query.page;
    const param = [req.query.uid, req.query.uid, req.query.uid];
    const sql = "select u.*, f.fileRoute from user u left join file f on f.uid = u.uid where u.uid = ?";
    connection.query(sql, param, function (err, result) {
      if (err) {
        console.log(err);
      }
      let route = req.app.get('views') + '/m_user/orgm_viewForm';
      // console.log(result)
      res.render(route, {
        result: result,
        page: page,
        searchType1: searchType1,
        searchType2: searchType2,
        searchType3: searchType3,
        searchText: searchText,
        keepSearch: keepSearch,
        admin: admin
      });
    });

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 등록 페이지 이동
router.get('/userInsertForm', (req, res) => {
  const admin = req.query.admin;
  var app = req.query.app == undefined ? "" : req.query.app;
  try {
    const userTypeSql = "select distinct userType from user\
                          where userType is not null and userType != ''\
                       order by field(userType, '형태') desc, userType asc;";
    const userPositionSql = "select distinct userPosition from user\
                              where userPosition is not null and userPosition != ''\
                           order by field(userPosition, '전체') desc, userPosition asc;";
    let userType;
    let userPosition;
    connection.query(userTypeSql, function (err, result) {
      if (err) {
        console.log(err);
      }
      userType = result;
      connection.query(userPositionSql, function (err, result) {
        if (err) {
          console.log(err);
        }
        userPosition = result;
        // 웹으로 접근시
        if (app == "") {
          let route = req.app.get('views') + '/m_user/orgm_writForm';
          res.render(route, {
            userType: userType,
            userPosition: userPosition,
            admin: admin
          });
          // 앱으로 접근시
        } else if (app == "app") {
          res.status(200).json({
            userPosition: userPosition,
            userType: userType,
            admin: admin
          });
        }
      });
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 등록
router.post('/userInsert', upload.array('file'), async (req, res) => {
  var app = req.body.app == undefined ? "" : req.body.app;
  var adminyn = req.body.adminyn == undefined ? "" : req.body.adminyn;
  const paths = req.files.map(data => data.path);
  const orgName = req.files.map(data => data.originalname);
  let uidSql;
  const userAdres = req.body.userAdres;
  const userAddress = userAdres.split(' ');
  const join = userAddress.slice(2).join(' ');
  // console.log(req.body.userImgyn)
  for (let i = 0; i < paths.length; i++) {
    if (req.files[i].size > 1000000) {
      sharp(paths[i]).resize({
          width: 2000
        }).withMetadata() //이미지 방향 유지
        .toBuffer((err, buffer) => {
          if (err) {
            throw err;
          }
          fs.writeFileSync(paths[i], buffer, (err) => {
            if (err) {
              throw err
            }
          });
        });
    }
  }
  //프로필 사진 없는경우
  var userImg;
  var a;
  if (req.body.userImgyn == '0') {
    userImg = '';
    a = 0;
  } else {
    userImg = paths[0];
    a = 1;
  }
  const param = [req.body.userName, req.body.hosName, req.body.hosPost, userAddress[0], userAddress[1], join, req.body.userAdres4, req.body.hosPhone1, req.body.hosPhone2, req.body.hosPhone3, req.body.userPhone1,
    req.body.userPhone2, req.body.userPhone3, req.body.userType, req.body.userPosition, req.body.hosDetail, req.body.hosMedicalInfo, req.body.userEmail,
    req.body.userFax, req.body.userUrl, userImg, adminyn
  ]
  // console.log(param)
  const sql = "call insertUser(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  if (adminyn == 'admin') {
    uidSql = "select max(uid) as uid from user where uid > 10000";
  } else {
    uidSql = "select max(uid) as uid from user where uid < 10000";
  }

  connection.query(sql, param, (err) => {
    if (err) {
      console.log(err)
    }
    connection.query(uidSql, (err, result) => {
      if (err) {
        throw err;
      }
      //프로필 사진 없는경우
      // var a;
      // if (req.body.userImgyn == '0') {
      //   a = 0
      // } else {
      //   a = 1
      // }
      for (let i = a; i < paths.length; i++) {
        const param3 = [paths[i], orgName[i], result[0].uid, path.extname(paths[i])];
        const sql3 = "insert into file(fileRoute, fileOrgName, uid, fileType) values (?, ?, ?, ?)";
        connection.query(sql3, param3, (err) => {
          if (err) {
            throw err;
          }

        });
      };
    });
    // 웹으로 접근시
    if (app == "") {
      //관리자 쿼리가 없으면 일반회원정보로, 있으면 개발자 회원정보로 이동.
      if (adminyn != '') {
        res.send('<script>alert("회원 등록이 완료되었습니다."); location.href="/admin/m_user/admin?page=1";</script>');
      } else {
        res.send('<script>alert("회원 등록이 완료되었습니다."); location.href="/admin/m_user/page?page=1";</script>');
      }
      // 앱으로 접근시
    } else if (app == "app") {
      res.json({
        msg: "success"
      });
    }
  });
});

//사용자 정보 수정 페이지 이동
router.post('/userUdtForm', async (req, res) => {
  try {
    var fileRoute = req.body.fileRoute;
    if (Array.isArray(fileRoute) == false) {
      fileRoute = [fileRoute];
    }
    const userTypeSql = "select distinct userType from user\
                          where userType is not null and userType != ''\
                       order by field(userType, '형태') desc, userType asc;";
    const userPositionSql = "select distinct userPosition from user\
                              where userPosition is not null and userPosition != ''\
                           order by field(userPosition, '전체') desc, userPosition asc;";
    let userType;
    let userPosition;
    connection.query(userTypeSql, function (err, result) {
      if (err) {
        console.log(err);
      }
      userType = result;
      connection.query(userPositionSql, function (err, result) {
        if (err) {
          console.log(err);
        }
        userPosition = result;
        let route = req.app.get('views') + '/m_user/orgm_udtForm';
        // console.log(fileRoute)
        res.render(route, {
          result: req.body,
          fileRoute: fileRoute,
          userImg: req.body.userImg,
          page: req.body.page,
          userType: userType,
          userPosition: userPosition,
          admin: req.body.admin
        });
      });
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

//사용자 정보 수정
router.post('/userUpdate', upload.array('file'), async (req, res) => {
  //첨부파일 삭제 x, 업로드만!
  const paths = req.files.map(data => data.path);
  const orgName = req.files.map(data => data.originalname);
  const userAdres = req.body.userAdres;
  const userAddress = userAdres.split(' ');
  const join = userAddress.slice(2).join(' ');
  const uid = req.body.uid;
  for (let i = 0; i < paths.length; i++) {
    if (req.files[i].size > 1000000) {
      sharp(paths[i]).resize({
          width: 2000
        }).withMetadata() //이미지 방향 유지
        .toBuffer((err, buffer) => {
          if (err) {
            throw err;
          }
          fs.writeFileSync(paths[i], buffer, (err) => {
            if (err) {
              throw err
            }
          });
        });
    }
  }
  //프로필 사진 없는경우
  var userImg;
  var a;
  //파일도 없고 기존파일도 없는경우
  if (req.body.userImgyn == '0') {
    if (req.body.userImg != '') {
      userImg = req.body.userImg;
      a = 0;
    } else {
      userImg = '';
      a = 0;
    }
  } else {
    userImg = paths[0];
    a = 1;
  }
  // console.log("userImg ====== " + userImg)
  // console.log("a ====== " + a)
  // console.log(paths)
  //사용자 DB 업데이트
  const param = [req.body.userName, userImg, req.body.userEmail, req.body.userType, req.body.userPosition,
    req.body.userPhone1, req.body.userPhone2, req.body.userPhone3, req.body.userFax,
    userAddress[0], userAddress[1], join, req.body.userAdres4, req.body.hosName, req.body.userUrl, req.body.hosPost,
    req.body.hosPhone1, req.body.hosPhone2, req.body.hosPhone3, req.body.userUrl, req.body.hosDetail, req.body.userPay, req.body.hosMedicalInfo, uid
  ]
  const sql = "update user set userName = ?, userImg = ?, userEmail = ?, userType = ?, userPosition = ?,\
                               userPhone1 = ?, userPhone2 = ?, userPhone3 = ?, userFax = ?,\
                               userAdres1 = ?, userAdres2 = ?, userAdres3 = ?, userAdres4 = ?,\
                               hosName = ?, userUrl = ?, hosPost = ?,\
                               hosPhone1 = ?, hosPhone2 = ?, hosPhone3 = ?, userUrl = ?, hosDetail = ?, userpay = ?, hosMedicalInfo  = ?\
                where uid = ?";
  connection.query(sql, param, function (err) {
    if (err) {
      console.log(err);
    }
    // console.log("userImg ====== " + userImg)
    // console.log("a ====== " + a)
    // console.log(paths)
    //파일 테이블 업데이트
    for (let i = a; i < paths.length; i++) {
      const fileSql = "insert into file(uid, fileRoute, fileOrgName, fileType) values (?, ?, ?, ?)";
      const param1 = [uid, paths[i], orgName[i], path.extname(paths[i])];
      // console.log(param1);
      connection.query(fileSql, param1, async (err) => {
        if (err) {
          console.error(err);
        }
        // console.log("file table upload success!!")
      });
    }
    res.redirect('selectOne?admin=' + req.body.admin + '&uid=' + uid + '&page=' + req.body.page);
  });
});

//사용자 여러명 삭제
router.get('/userDelete', (req, res) => {
  var app = req.query.app == undefined ? "" : req.query.app;
  const param = req.query.uid;
  const str = param.split(',');
  // const route = req.query.userImg;
  // const img = route.split(',');
  // DB 글삭제
  let fileAll;
  for (var i = 0; i < str.length; i++) {
    const sql = "delete from user where uid = ?";
    connection.query(sql, str[i], (err) => {
      if (err) {
        console.log(err)
      }
    });
    //서버에서 파일 삭제
    const fileSql = "select fileRoute from file where uid = ?"
    connection.query(fileSql, str[i], (err, result) => {
      if (err) {
        console.log(err)
      }
      fileAll = result
      //서버에서 프로필 이미지 삭제
      for (var j = 0; j < fileAll.length; j++) {
        if (fileAll[j] !== '') {
          // console.log(fileAll[j])
          fs.unlinkSync(fileAll[j].fileRoute, (err) => {
            if (err) {
              console.log(err);
            }
            return;
          });
        }
      }
    });
    //파일 테이블에서 삭제
    const sql1 = "delete from file where uid = ?";
    connection.query(sql1, str[i], (err) => {
      if (err) {
        console.log(err)
      }
    });
  }

  if (req.query.admin != '') {
    res.send('<script>alert("삭제되었습니다"); location.href="/admin/m_user/admin?page=1";</script>');
  } else {
    res.send('<script>alert("삭제되었습니다"); location.href="/admin/m_user/page?page=1";</script>');
  }
});

//사용자 한명 삭제
router.post('/oneUserDelete', (req, res) => {
  var app = req.query.app == undefined ? "" : req.query.app;
  const param = req.body.uid;
  var userImg = req.body.userImg;
  var fileRoute = req.body.fileRoute;
  if (Array.isArray(fileRoute) == false) {
    fileRoute = [fileRoute];
  }
  // console.log(fileRoute[0] != undefined)
  // onsole.log(fileRoute[0] == undefined)
  // var img2 = req.query.hosImg;
  // var img3 = req.query.infoImg;
  // var arr = img1 + ',' + img2 + ',' + img3;
  // var img = arr.split(',');

  const sql = "delete from user where uid = ?";
  connection.query(sql, param, (err, row) => {
    if (err) {
      console.log(err)
    }
    //서버에서 프로필 이미지 삭제
    for (var j = 0; j < fileRoute.length; j++) {
      if (fileRoute[j] != undefined) {
        // console.log(fileRoute)
        fs.unlinkSync(fileRoute[j], (err) => {
          if (err) {
            console.log(err);
          }
          return;
        });
      }
    }
    //프로필 삭제
    if (userImg != '') {
      fs.unlinkSync(userImg, (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
    }
    //파일 테이블에서 삭제
    const sql1 = "delete from file where uid = ?";
    connection.query(sql1, param, (err) => {
      if (err) {
        console.log(err)
      }
    });
    // 웹으로 접근시
    if (app == "") {
      //관리자 쿼리가 없으면 일반회원정보로, 있으면 개발자 회원정보로 이동.
      if (req.body.admin != '') {
        res.send('<script>alert("삭제되었습니다"); location.href="/admin/m_user/admin?page=1";</script>');
      } else {
        res.send('<script>alert("삭제되었습니다"); location.href="/admin/m_user/page?page=1";</script>');
      }
      // 앱으로 접근시
    } else if (app == "app") {
      res.json({
        msg: "success"
      });
    }
  });
});


//첨부파일 삭제
router.post('/imgDelete', async (req, res) => {
  var deleteFileRoute = req.body.deleteFileRoute;
  const page = req.body.page;
  if (Array.isArray(deleteFileRoute) == false) {
    deleteFileRoute = [deleteFileRoute];
  }
  // console.log(req.body)
  // console.log(typeof deleteFileRoute)
  let sql;
  let param = [];
  try {
    if (req.body.profileyn == '0') {
      sql = "update user set userImg = null where uid = ?";
      param = req.body.uid;
    } else {
      sql = "delete from file where fileRoute = ?";
      param = deleteFileRoute;
    }
    // console.log(sql)
    // console.log(param)
    connection.query(sql, param, (err) => {
      if (err) {
        console.log(err)
      }
      fs.unlinkSync(deleteFileRoute.toString(), (err) => {
        if (err) {
          console.log(err);
        }
        return;
      });
      var fileSql = "select u.userImg, f.fileRoute from user u left join file f on f.uid = u.uid where u.uid = ?";
      var fileRoute = [];
      connection.query(fileSql, req.body.uid, function (err, result) {
        if (err) {
          console.log(err);
        }
        for (i = 0; i < result.length; i++) {
          // console.log(result[i].fileRoute)
          fileRoute[i] = result[i].fileRoute;
        }
        const userImg = result[0].userImg;
        // console.log(result)
        const userTypeSql = "select distinct userType from user\
                          where userType is not null and userType != ''\
                       order by field(userType, '형태') desc, userType asc;";
        const userPositionSql = "select distinct userPosition from user\
                              where userPosition is not null and userPosition != ''\
                           order by field(userPosition, '전체') desc, userPosition asc;";
        let userType;
        let userPosition;
        connection.query(userTypeSql, function (err, result) {
          if (err) {
            console.log(err);
          }
          userType = result;
          connection.query(userPositionSql, function (err, result) {
            if (err) {
              console.log(err);
            }
            userPosition = result;
            // console.log(fileRoute)
            let route = req.app.get('views') + '/m_user/orgm_udtForm';
            res.render(route, {
              result: req.body,
              fileRoute: fileRoute,
              userImg: userImg,
              page: page,
              userType: userType,
              userPosition: userPosition,
              admin: req.body.admin
            });

          });
        });
      });
    });
  } catch (error) {
    if (error.code == "ENOENT") {
      console.log("프로필 삭제 에러 발생");
    }
  }
});

//엑셀 다운로드
router.get('/userExcel', async (req, res) => {
  var searchType1 = req.query.searchType1 == undefined ? "" : req.query.searchType1;
  var searchType2 = req.query.searchType2 == undefined ? "" : req.query.searchType2;
  var searchType3 = req.query.searchType3 == undefined ? "" : req.query.searchType3;
  // var searchType4 = req.query.searchType4 == undefined ? "" : req.query.searchType4;
  var searchText = req.query.searchText == undefined ? "" : req.query.searchText;
  var conf = {};

  conf.cols = [{
      caption: '번호',
      type: 'number',
      width: 8
    }, {
      caption: '회원명',
      captionStyleIndex: 1,
      type: 'string',
      width: 50
    }, {
      caption: '병원명',
      captionStyleIndex: 1,
      type: 'string',
      width: 30
    }, {
      caption: '우편번호',
      captionStyleIndex: 1,
      type: 'string',
      width: 8
    },
    {
      caption: '병원주소',
      captionStyleIndex: 1,
      type: 'string',
      width: 30
    },
    {
      caption: '병원번호',
      captionStyleIndex: 1,
      type: 'string',
      width: 15
    }, {
      caption: '형태',
      captionStyleIndex: 1,
      type: 'string',
      width: 15
    }, {
      caption: '역할',
      captionStyleIndex: 1,
      type: 'string',
      width: 12
    }
  ];

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
      if (err) {
        console.log(err);
      }
      var arr = [];
      for (var i = 0; i < results.length; i++) {
        var resultData = [
          results[i].uid,
          results[i].userName,
          results[i].hosName,
          results[i].hosPost,
          results[i].userAdres1 + ' ' + results[i].userAdres2 + results[i].userAdres3,
          results[i].hosPhone1 + '-' + results[i].hosPhone2 + '-' + results[i].hosPhone3,
          results[i].userType,
          results[i].userPosition
        ];
        arr.push(resultData);
      }
      conf.rows = arr;
      var result = nodeExcel.execute(conf);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats');
      res.setHeader("Content-Disposition", "attachment; filename=" + "user.xlsx");
      res.end(result, 'binary');
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

module.exports = router;