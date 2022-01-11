const mysql = require('mysql'); // mysql 모듈 로드

const conn = { // mysql 접속 설정
    host: '101.101.216.50',
    port: '3306',
    user: 'resoft',
    password: 'Qwert1234!',
    database: 'carbon'
};

// const connt = async () => {
//     try {
//         var connection = mysql.createConnection(conn); // DB 커넥션 생성
//         connection.connect();
//     } catch(error) {
//         console.log(error);
//     }
// }
// DB 접속

// var testQuery = "INSERT INTO `members` (`username`,`password`) VALUES ('test','test');";

// connection.query(testQuery, function (err, results, fields) { // testQuery 실행
//     if (err) {
//         console.log(err);
//     }
//     console.log(results);
// });

// var testQuery = "SELECT * FROM user";

// connection.query(testQuery, function (err, results, fields) { // testQuery 실행
//     if (err) {
//         console.log(err);
//     }
//     console.log(results);
// });

module.exports = conn;
//connection.end(); // DB 접속 종료