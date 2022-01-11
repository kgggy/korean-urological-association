var express = require('express');
const mysql = require('mysql'); // mysql 모듈 로드

// var router = express.Router();

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


const connt = require("../../config/db")

var router = express.Router();

// /* GET home page. */
// router.post('/', async(req, res) => {
//   try {
//     const sql = "select * from user";
//     var connection = mysql.createConnection(connt); // DB 커넥션 생성
//          connection.connect();
//          let user;
//     connection.query(sql, function(err, results, fields) {
//       if(err) {
//         console.log(err);
//       }
//       user = results;
//       res.status(200).json(user);
//       // console.log(user);
//     });
//     console.log(user)
    

//   } catch (error) {
    
//     res.status(401).send(error.message);
//   }
  
// });

router.post('/user', async(request, response) => {
  try {
  // const {
  //   body: {userEmail,
  //          userNick,
  //          userPwd}
  // } = request
  // const sql = "insert into user(userEmail, userNick, userPwd) values()";
  // var connection = mysql.createConnection(connt); // DB 커넥션 생성
  //      connection.connect();
  //      let user;
  //      connection.query(sql, function(err, results, fields) {
  //       if(err) {
  //         console.log(err);
  //       }
  //       user = results;
  //       res.status(200).json(user);
  //       // console.log(user);
  //     });
  //     console.log(user)

  let {userEmail, userNick, userPwd} = request.body;
  res.send('respond with a resource');
  }
  catch(error) {
    res.status(401).send(error.message);
  }
});


module.exports = router;
