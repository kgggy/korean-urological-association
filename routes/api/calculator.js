var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const models = require("../../models");
const connt = require("../../config/db")
var url = require('url');
const fs = require('fs');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

// 새로 만든 dbCal
    // 질문별 옵션 저장 객체
    router.get('/', async (req, res) => {
    let optionPerQuestion = {};
    // question 테이블에서 모든 행과 행의 갯수를 구함
    const dbQuestion = await models.question.findAndCountAll({
        raw: true,
    });
    // 위 쿼리 결과의 갯수만큼 반복
    for(let i=0;i<dbQuestion.count;i++){
        // calOption 테이블에서 question 테이블의 qtnId로 조회
        const dbOption = await models.calOption.findAll({
            where: {qtnId : dbQuestion.rows[i].qtnId},
            raw: true,
        });
        // 위 쿼리 결과를 dbQuestion의 i번째 객체에 저장
        dbQuestion.rows[i]['options'] = dbOption;
        // 저장한 dbQuestion의 i번째 객체를 질문별 옵션 저장 객체에 저장
        optionPerQuestion[i] = dbQuestion.rows[i];
    }
    res.json( optionPerQuestion );
});

module.exports = router;