var express = require('express');
var router = express.Router();
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;

const multer = require("multer");
const path = require('path');
const fs = require('fs');
var connection = require('../../config/db').conn;

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

// 내 정보 상세보기
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
router.patch('/:uid', upload.single('file'), async (req, res) => {
    var param;
    var pathe = "";
    const userImg = req.body.userImg;
    // const {
    //     userNick,
    //     uid,
    //     userImg
    // } = req.body;

    // // console.log(uid);
    // // console.log(userImg);

    // const sameNickNameUser = await models.user.findOne({
    //     where: {
    //         userNick,
    //         uid: {
    //             [Op.notIn]: [uid],
    //         },
    //     }
    // });

    // if (sameNickNameUser !== null) {
    //     return res.json({
    //         registerSuccess: false,
    //         message: "이미 존재하는 닉네임입니다.",
    //     });
    // }

    if (req.file != null) {
        console.log("프로필 변경함 => userImg 최초만 공백이고 나머지는 원래경로 들어옴")
        pathe = req.file.path;
        param = [req.body.userName, req.body.userPosition, req.body.userType,
            req.body.userAdres1, req.body.userAdres2, req.body.userAdres3,
            req.body.hosName, req.body.userUrl, req.body.userEmail,
            req.body.userPhone1, req.body.userPhone2, req.body.userPhone3,
            req.body.hosPhone1, req.body.hosPhone2, req.body.hosPhone3,
            pathe, req.params.uid
        ];
    } else {
        console.log("프로필 변경 안함 => userImg 원래 경로임")
        param = [req.body.userName, req.body.userPosition, req.body.userType,
            req.body.userAdres1, req.body.userAdres2, req.body.userAdres3,
            req.body.hosName, req.body.userUrl, req.body.userEmail,
            req.body.userPhone1, req.body.userPhone2, req.body.userPhone3,
            req.body.hosPhone1, req.body.hosPhone2, req.body.hosPhone3,
            userImg, req.params.uid
        ];
    }
    console.log(param)
    const sql = "update user set userName = ?, userPosition = ?, userType = ?,\
                                 userAdres1 = ?, userAdres2 = ?, userAdres3 = ?,\
                                 hosName = ?, userUrl = ?, userEmail = ?,\
                                 userPhone1 = ?, userPhone2 = ?, userPhone3 = ?,\
                                 hosPhone1 = ?, hosPhone2 = ?, hosPhone3 = ?, userImg = ?\
                  where uid = ?";
    // connection.query(sql, param, (err) => {
    //     if (err) {
    //         console.error(err);
    //     }
    //     if (req.file != null || userImg != undefined) {
    //         fs.unlinkSync(userImg, (err) => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //         });
    //     }
    //     return res.json({
    //         msg: "success"
    //     });
    // });
    connection.query(sql, param, (err) => {
        if (err) {
            console.error(err);
        }
        // console.log("==================userImg = " + userImg);
        //프로필이 수정되는 경우 원래 프로필사진 삭제
        if (req.file != undefined && req.file != null) {
            if (userImg != undefined && userImg != '') {
                console.log("프로필 삭제한다!!!")
                fs.unlinkSync(userImg, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
        return res.json({
            msg: "success"
        });
    });
});

module.exports = router;