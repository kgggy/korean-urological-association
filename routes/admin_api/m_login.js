var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const connt = require("../../config/db")
const crypto = require('crypto');
const models = require('../../models');
const sequelize = require('sequelize');
// DB 커넥션 생성
// var connection = mysql.createConnection(connt);
// connection.connect();
var connection = require('../../config/db').conn;
//로그인 페이지로 이동
router.get('/', (req, res) => {
    let route = req.app.get('views') + '/index';
    res.render(route, {
        layout: false
    })
})

//로그인
router.post('/login', async (req, res) => {
    console.log("login ===============")
    const {
        adminPwd,
        adminId
    } = req.body;

    const nickChk = await models.admin.findOne({
        where: {
            adminId
        }
    });

    if (nickChk == null) {
        return res.send('<script>alert("아이디 또는 비밀번호를 잘못 입력했습니다."); location.href = document.referrer;</script>');
    }

    // const makePasswordHashed = (adminId, plainPassword) =>
    //     new Promise(async (resolve, reject) => {
    //         // salt를 가져오는 부분은 각자의 DB에 따라 수정
    //         const salt = await models.admin
    //             .findOne({
    //                 attributes: ['salt'],
    //                 raw: true,
    //                 where: {
    //                     adminId,
    //                 },
    //             }).then((result) => result.salt);

    //         crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
    //             if (err) reject(err);
    //             resolve(key.toString('base64'));
    //         });
    //     });

    // const password = await makePasswordHashed(adminId, adminPwd);
    // const dbPwd = await models.admin.findOne({
    //     where: {
    //         adminId
    //     },
    //     raw: true
    // })
    const pwdChk = await models.admin.findOne({
        where: {
            adminPwd
        }
    });

    if (pwdChk == null) {
        return res.send('<script>alert("아이디 또는 비밀번호를 잘못 입력했습니다."); location.href = document.referrer;</script>');
    }
    if (nickChk !== '' && pwdChk !== '') {
        if (req.session.user) {
            console.log("session 있음.")
            res.redirect('/admin/m_user/page?page=1');
        } else { // 세션 없는 admin일 경우 만들어줌
            req.session.user = {
                // isAdmin: true,           // user, admin 구분해주려고. admin 계정밖에 없으니까 필요없음.
                // comId: dbPwd.comId,
                adminId: adminId
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