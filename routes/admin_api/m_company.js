var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connt = require("../../config/db")
const crypto = require('crypto');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//로그인 페이지로 이동
router.get('/login', async (req, res) => {
    let route = req.app.get('views') + '/index';
    console.log(route);
    res.render(route, {
        layout: false
    });
});

//회원가입 페이지 이동
router.get('/join', async (req, res) => {
    let route = req.app.get('views') + '/m_company/ComSignUp.ejs';
    console.log(route);
    res.render(route, {
        layout: false
    });
});

//기업 회원가입
router.post('/companyEnroll', async (req, res) => {
    const {
        comNick,
        comName,
        comNum,
        comAdres1,
        comAdres2,
        comPresiName,
        comManagerName,
        comPhoneNum,
        comEmail,
        comAgree
    } = req.body;

    // const sameEmailUser = await models.user.findOne({
    //   where: {
    //     userEmail
    //   }
    // });
    // if (sameEmailUser !== null) {
    //   return res.send('<script>alert("이미 존재하는 이메일입니다."); history.go(-1);</script>');
    // }

    const sameNickNameCompany = await models.company.findOne({
        where: {
            comNick
        }
    });
    if (sameNickNameCompany !== null) {
        return res.send('<script>alert("이미 존재하는 닉네임입니다."); history.go(-1);</script>');
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
                    comPwd: key.toString('base64'),
                    salt
                });
            });
        });

    const {
        comPwd,
        salt
    } = await createHashedPassword(req.body.comPwd);

    await models.company.create({
        comPwd,
        salt,
        comName,
        comNum,
        comAdres1,
        comAdres2,
        comPresiName,
        comManagerName,
        comPhoneNum,
        comEmail,
        comAgree
    });

    res.send('<script>alert("회원 등록이 완료되었습니다. 관리자 검토 후 승인처리됩니다."); location.href="/admin/m_company/login";</script>');
});

module.exports = router;