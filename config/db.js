const mysql = require('mysql'); // mysql 모듈 로드

const conn = { // mysql 접속 설정
    host: '101.101.216.50',
    port: '3306',
    user: 'resoft',
    password: 'Qwert1234!',
    database: 'urological_association_mmate',
    multipleStatements: true
};

module.exports = conn;