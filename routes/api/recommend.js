var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const models = require("../../models");
const connt = require("../../config/db")

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//좋아요-certiContent
router.post('/add/certi', async (req, res) => {
    const {
        uid,
        certiContentId
    } = req.body;

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

    const certiChk = await models.certiContent.findOne({
        where: {
            certiContentId: certiContentId
        }
    });
    if (certiChk == null) {
        return res.json({
            existCertiId: false,
            message: "없는 인증글입니다."
        });
    }

    const uidChk = await models.user.findOne({
        where: {
            uid: uid
        }
    });
    if (uidChk == null) {
        return res.json({
            existUid: false,
            message: "없는 유저입니다."
        });
    }

    const dbContent = await models.recommend.findAll({
        where: {
            uid: uid,
            certiContentId: certiContentId
        },
        raw: true
    });
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
    } else if (dbContent.length == 0) {
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
    const {
        uid,
        writId
    } = req.body;

    const postChk = await models.post.findOne({
        where: {
            writId: writId
        }
    });
    if (postChk == null) {
        return res.json({
            existPost: false,
            message: "없는 인증글입니다."
        });
    }

    const uidChk = await models.user.findOne({
        where: {
            uid: uid
        }
    });
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

    const dbContent = await models.recommend.findAll({
        where: {
            uid: uid,
            writId: writId
        },
        raw: true
    });
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

//탄소실천, 챌린지 좋아요한 유저 목록 조회
router.post('/likeUserList/certi', async (req, res) => {
    try {
        const param = req.body.certiContentId;
        const sql = "select u.userNick, u.userImg, r.*\
                       from recommend r\
                  left join certiContent c on c.certiContentId = r.certiContentId\
                  left join user u on u.uid = r.uid where r.certiContentId = ?";
        let certiLikeUsers;
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
            }
            certiLikeUsers = results;
            res.status(200).json(certiLikeUsers);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 좋아요한 유저 목록 조회
router.post('/likeUserList/post', async (req, res) => {
    try {
        const param = req.body.writId;
        const sql = "select u.userNick, u.userImg, r.*\
                       from recommend r\
                  left join post p on p.writId = r.writId\
                  left join user u on u.uid = r.uid where r.writId = ?";
        let writLikeUsers;
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
            }
            writLikeUsers = results;
            res.status(200).json(writLikeUsers);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

module.exports = router;