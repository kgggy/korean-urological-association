const multer = require("multer");
const path = require('path');
const fs = require('fs');

var express = require('express');
var router = express.Router();

//파일 업로드 모듈
var upload = multer({ //multer안에 storage정보  
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            //파일이 이미지 파일이면
            if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
                // console.log("이미지 파일입니다.");
                callback(null, 'public/images/support');
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
        fileSize: 1024 * 1024 * 1024 //1기가
    },

});

// DB 커넥션 생성                   
var connection = require('../../config/db').conn;

//배너 전체조회
router.get('/banner', async (req, res) => {
    try {
        const sql = "select *, date_format(startDate, '%Y-%m-%d') as startDatefmt, date_format(endDate, '%Y-%m-%d') as endDatefmt\
                       from banner where bannerDiv = ? order by showNo is null asc, nullif(showNo, '') is null asc, showNo, bannerId";
        connection.query(sql, req.query.bannerDiv, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            let route = req.app.get('views') + '/m_banner/banner';
            res.render(route, {
                'results': results
            });
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//배너 등록폼 이동
router.get('/bannerWritForm', async (req, res) => {
    let route = req.app.get('views') + '/m_banner/banner_writForm';
    res.render(route);
});

//배너 등록
router.post('/bannerWrit', upload.single('file'), async function (req, res) {
    var path = "";
    var param = "";
    if (req.file != null) {
        path = req.file.path;
        param = [path, req.body.startDate, req.body.startDate,
            req.body.endDate, req.body.endDate, req.body.showYN, req.body.showNo, req.body.bannerDiv
        ];
    } else {
        param = [req.body.bannerRoute, req.body.startDate, req.body.startDate, req.body.endDate, req.body.endDate, req.body.showYN, req.body.showNo, req.body.bannerDiv];
    }
    // console.log(param);
    try {
        const sql = "insert into banner(bannerRoute, startDate, endDate, showYN, showNo, bannerDiv) values(?, if(? = '',null,?), if(? = '',null,?), ?, ?, ?)";
        connection.query(sql, param, (err) => {
            if (err) {
                throw err;
            }
            res.redirect("/admin/m_banner/banner?bannerDiv=" + req.body.bannerDiv);
        });
    } catch (error) {
        res.send(error.message);
    }
});

//배너 수정폼 이동
router.get('/bannerUdtForm', async (req, res) => {
    try {
        const param = req.query.bannerId;
        const sql = "select *, date_format(startDate, '%Y-%m-%d') as startDatefmt, date_format(endDate, '%Y-%m-%d') as endDatefmt from banner where bannerId = ?"
        connection.query(sql, param, function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_banner/banner_udtForm';
            res.render(route, {
                'result': result
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//배너 수정
router.post('/bannerUpdate', upload.single('file'), async (req, res) => {
    var path = "";
    var param = "";
    if (req.file != null) {
        path = req.file.path;
        param = [path, req.body.bannerDiv, req.body.startDate, req.body.startDate,
            req.body.endDate, req.body.endDate, req.body.showYN, req.body.showNo, req.body.bannerId
        ];
    } else {
        param = [req.body.bannerRoute, req.body.bannerDiv, req.body.startDate, req.body.startDate,
            req.body.endDate, req.body.endDate, req.body.showYN, req.body.showNo, req.body.bannerId
        ];
    }
    const sql = "update banner set bannerRoute = ?, bannerDiv = ?, startDate = if(? = '',null,?), endDate = if(? = '',null,?), showYN = ?, showNo = ?\
                                 where bannerId = ?";
    connection.query(sql, param, (err, row) => {
        if (err) {
            console.error(err);
        }
        res.redirect('banner?bannerDiv=' + req.body.bannerDiv);
    });
});

//배너 이미지 파일 삭제
router.get('/bannerImgDelete', async (req, res) => {
    const param = req.query.bannerRoute;
    try {
        const sql = "update banner set bannerRoute = null where bannerId = ?";
        connection.query(sql, req.query.bannerId, (err, row) => {
            if (err) {
                console.log(err)
            }
            fs.unlinkSync(param, (err) => {
                if (err) {
                    console.log(err);
                }
                return;
            });
        })
    } catch (error) {
        if (error.code == "ENOENT") {
            console.log("배너 파일 삭제 에러 발생");
        }
    }
    res.redirect('bannerUdtForm?bannerId=' + req.query.bannerId);
});

//배너 삭제
router.get('/bannerDelete', async (req, res) => {
    try {
        const bannerDiv = req.query.bannerDiv;
        const param = req.query.bannerRoute;
        console.log(bannerDiv, param, req.query.bannerId)
        const sql = "delete from banner where bannerId = ?";
        connection.query(sql, req.query.bannerId, (err, row) => {
            if (err) {
                console.log("쿼리 에러입니다.");
            }
            console.log(param);
            if(param !== '') {
                fs.unlinkSync(param, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            res.redirect('banner?bannerDiv=' + bannerDiv);
        });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;