var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const connt = require("../../config/db")
const crypto = require('crypto');
const models = require('../../models');
const sequelize = require('sequelize');
// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//로그인 페이지로 이동
router.get('/', (req, res) => {
    let route = req.app.get('views') + '/index';
    res.render(route, {
        layout: false
    })
})

//로그인
router.post('/login', async (req, res) => {
    const {
        comPwd,
        comNick
    } = req.body;

    const nickChk = await models.company.findOne({
        where: {
            comNick
        }
    });

    if (nickChk == null) {
        return res.send('<script>alert("아이디 또는 비밀번호를 잘못 입력했습니다."); location.href = document.referrer;</script>');
    }

    const makePasswordHashed = (comNick, plainPassword) =>
        new Promise(async (resolve, reject) => {
            // salt를 가져오는 부분은 각자의 DB에 따라 수정
            const salt = await models.company
                .findOne({
                    attributes: ['salt'],
                    raw: true,
                    where: {
                        comNick,
                    },
                }).then((result) => result.salt);

            crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
                if (err) reject(err);
                resolve(key.toString('base64'));
            });
        });

    const password = await makePasswordHashed(comNick, comPwd);
    const dbPwd = await models.company.findOne({
        where: {
            comNick
        },
        raw: true
    })
    if (password == dbPwd.comPwd) {
        // console.log("success")
        if (req.session.user) {
            res.redirect('/admin/m_user/page?page=1');
            console.log("session 원래있움~~~")
        } else { // 세션 없는 admin일 경우 만들어줌
            req.session.user = {
                // isAdmin: true,           // user, admin 구분해주려고. admin 계정밖에 없으니까 필요없음.
                comId: dbPwd.comId,
                comNick: comNick
            };
            res.redirect('/admin/m_user/page?page=1');
            console.log("session 만들어짐!!!")
            // console.log(req.session.user)
        }
    } else {
        return res.send('<script>alert("아이디 또는 비밀번호를 잘못 입력했습니다."); location.href = document.referrer;</script>');
    }


});

//로그아웃
router.get('/logout', async (req, res) => {
    if (req.session.user) {
        console.log('로그아웃');

        req.session.destroy(function (err) {
            if (err) throw err;
            console.log('세션 삭제하고 로그아웃됨');
            res.send("<script>alert('로그아웃 되었습니다.'); location.href='/admin'</script>");
        });
    } else {
        console.log('로그인 상태 아님');
        res.redirect('/admin/m_user/page?page=1');
    }
});

module.exports = router;