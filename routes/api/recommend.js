var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const models = require("../../models");
const connt = require("../../config/db")
var url = require('url');
const fs = require('fs');
const { user } = require('../../config/db');

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//좋아요-certiContent
router.post('/add/certi', async (req, res) => {
    const {uid, certiContentId} = req.body;

    if (uid == null) {
        return res.json({
            isEmptyuid: true,
            message: "uid를 입력해주세요."
        });
    }

    if (certiContentId == null) {
        return res.json({
            isEmptyCertiId: true,
            message: "certiContentId를 입력해주세요."
        });
    }

    const certiChk = await models.certiContent.findOne({ where: { certiContentId: certiContentId } });
    if (certiChk == null) {
        return res.json({
            existCertiId: false,
            message: "없는 인증글입니다."
        });
    }

    const uidChk = await models.user.findOne({ where: { uid: uid } });
    if (uidChk == null) {
        return res.json({
            existUid: false,
            message: "없는 유저입니다."
        });
    }

    const dbContent = await models.recommend.findAll({where: {uid: uid, certiContentId: certiContentId}, raw: true});
    console.log(dbContent);

    if (dbContent.length !== 0) {
        models.recommend.destroy({
            where: {
                uid: uid,
                certiContentId: certiContentId
            }
        });
        res.json({
            likeSuccess: false,
            msg: "좋아요 취소되었습니다."
        });
    } else if (dbContent.length == 0 ){
        models.recommend.create({
            uid: uid,
            certiContentId: certiContentId
        })
        res.json({
            likeSuccess: true,
            msg: "좋아요 완료되었습니다."
        })
    };
    
});


//좋아요-post
router.post('/add/post', async (req, res) => {
    const { uid, writId } = req.body;

    const certiChk = await models.certiContent.findOne({ where: { certiContentId: certiContentId } });
    if (certiChk == null) {
        return res.json({
            existCertiId: false,
            message: "없는 인증글입니다."
        });
    }

    const uidChk = await models.user.findOne({ where: { uid: uid } });
    if (uidChk == null) {
        return res.json({
            existUid: false,
            message: "없는 유저입니다."
        });
    }

    if (uid == null) {
        return res.json({
            isEmptyuid: true,
            message: "uid를 입력해주세요."
        });
    }

    if (writId == null) {
        return res.json({
            isEmptyWritId: true,
            message: "writId를 입력해주세요."
        });
    }

    const dbContent = await models.recommend.findAll({ where: { uid: uid, writId: writId }, raw: true });
    console.log(dbContent);

    if (dbContent.length !== 0) {
        models.recommend.destroy({
            where: {
                uid: uid,
                writId: writId
            }
        });
        res.json({
            likeSuccess: false,
            msg: "좋아요가 취소되었습니다."
        });
    } else if (dbContent.length == 0) {
        models.recommend.create({
            uid: uid,
            writId: writId
        })
        res.json({
            likeSuccess: true,
            msg: "좋아요가 완료되었습니다."
        })
    };
});

//좋아요한 유저 목록 조회
router.get('/likeUserList/certi', async (req, res) => {
    const { certiContentId } = req.body;
    const dbUid = await models.recommend.findAll({
        where: { certiContentId: certiContentId },
        raw: true,
        include: [{
            model: models.user,
            attributes: ['userNick', 'userImg']
        }]
    });
    res.json(dbUid);
});

router.get('/likeUserList/post', async (req, res) => {
    const { writId } = req.body;
    const dbUid = await models.recommend.findAll({
        where: { writId: writId },
        raw: true,
        include: [{
            model: models.user,
            attributes: ['userNick', 'userImg']
        }]
    });
    const dbWritId = await models.recommend.findOne({ where: { writId: writId }, attributes: ['writId'] });
    if (dbUid[0]['writId'] !== dbWritId['writId']) {
        console.log(dbUid[0]['writId']);
        console.log(dbWritId['writId']);
        
        res.json({ existPost: false, msg: "글이 없습니다." })
    } else {
        res.json(dbUid);
    }


// 새로 만든 dbCal
// 질문별 옵션 저장 객체
    router.get('/calculator', async (req, res) => {
        let optionPerQuestion = {};
        // question 테이블에서 모든 행과 행의 갯수를 구함
        const dbQuestion = await models.question.findAndCountAll({
            raw: true,
        });
        // 위 쿼리 결과의 갯수만큼 반복
        for (let i = 0; i < dbQuestion.count; i++) {
            // calOption 테이블에서 question 테이블의 qtnId로 조회
            const dbOption = await models.calOption.findAll({
                where: { qtnId: dbQuestion.rows[i].qtnId },
                raw: true,
            });
            // 위 쿼리 결과를 dbQuestion의 i번째 객체에 저장
            dbQuestion.rows[i]['options'] = dbOption;
            // 저장한 dbQuestion의 i번째 객체를 질문별 옵션 저장 객체에 저장
            optionPerQuestion[i] = dbQuestion.rows[i];
        }
        res.json(optionPerQuestion);
    });
});

module.exports = router;