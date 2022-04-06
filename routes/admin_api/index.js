const express = require('express');
const router = express.Router();

const m_login = require('./m_login.js');
const m_user = require('./m_user.js');
const m_support = require('./m_support.js');
const m_notice = require('./m_notice.js');
const m_certification = require('./m_certification.js');
const m_certiContent = require('./m_certiContent.js');
const m_comment = require('./m_comment.js');
const m_company = require('./m_company.js');
const m_gallery = require('./m_gallery.js');

// router.use('/', (req,res,next) => {
//     if(req.url == '/' || req.url == '/login') {
//         console.log("세션 검사 하지않고 로그인페이지로")
//         next();
//     } else {                                            // 로그인 페이지 이외의 페이지에 진입하려고 하는 경우
//         if(req.session.user) {
//             console.log("세션이 있다.")
//             next();
//             // if(req.session.user.isAdmin) {
//             //     next();
//             // } else {
//             //     res.send("<script>alert('어드민 계정으로 로그인 해주세요');location.href='/admin'</script>");
//             // }                            // user와 admin이 같은 페이지를 이용할 때 구분해줘야 할 때
//         } else {
//             console.log("세션이 없다.")
//             res.send("<script>alert('로그인이 필요합니다.');location.href='/admin'</script>");
//         }
//     }
// });
router.use('/', m_login);
router.use('/m_user', m_user);
router.use('/m_support', m_support);
router.use('/m_notice', m_notice);
router.use('/m_certification', m_certification);
router.use('/m_certiContent', m_certiContent);
router.use('/m_comment', m_comment);
router.use('/m_company', m_company);
router.use('/m_gallery', m_gallery);

module.exports = router;