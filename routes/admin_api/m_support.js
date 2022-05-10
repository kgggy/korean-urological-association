const multer = require("multer");
const path = require('path');
const fs = require('fs');

const sharp = require('sharp');
var express = require('express');
var router = express.Router();

// DB 커넥션 생성                   
var connection = require('../../config/db').conn;

//파일 업로드 모듈
var upload = multer({ //multer안에 storage정보  
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            fs.mkdir('uploads/support', function (err) {
                if (err && err.code != 'EEXIST') {
                    console.log("already exist")
                } else {
                    callback(null, 'uploads/support');
                }
            })
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

//후원목록조회
router.get('/', async (req, res) => {
    try {
        let support;
        const sql = "select * from support order by 1 desc";
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            support = results
                let route = req.app.get('views') + '/m_support/support';
                res.render(route, {
                    support: support
                });
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//후원목록상세조회
router.get('/supportSelectOne', async (req, res) => {
    try {
        const param = req.query.supportId;
        const sql = "select b.*, f.* from support b join file f on b.supportId = f.supportId where b.supportId = ?";
        connection.query(sql, param, (err, result) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            let route = req.app.get('views') + '/m_support/support_viewForm';
            res.render(route, {
                result: result
            });
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//후원광고 등록폼 이동
router.get('/supportWritForm', async (req, res) => {
    let route = req.app.get('views') + '/m_support/support_writForm';
    res.render(route);
});

//후원광고 등록
router.post('/supportWrit', upload.array('file'), async function (req, res) {
    const param = [req.body.supportUrl, req.body.supportTitle, req.body.supportDetail];
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    try {
        const sql = "insert into support(supportUrl, supportTitle, supportDetail) values(?, ?, ?);\
                     select max(supportId) as supportId from support;";
        for (let i = 0; i < paths.length; i++) {
            if (req.files[i].size > 1000000) {
                sharp(paths[i]).resize({
                    width: 2000
                }).withMetadata() //이미지 방향 유지
                    .toBuffer((err, buffer) => {
                        if (err) {
                            throw err;
                        }
                        fs.writeFileSync(paths[i], buffer, (err) => {
                            if (err) {
                                throw err
                            }
                        });
                    });
            }
        }
        connection.query(sql, param, (err, results) => {
            if (err) {
                throw err;
            }
            const supportId = results[1][0].supportId;
            for (let i = 0; i < paths.length; i++) {
                const param2 = [supportId, paths[i], orgName[i], path.extname(paths[i])];
                const sql2 = "insert into file(supportId, fileRoute, fileOrgName, fileType) values (?, ?, ?, ?)";
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            };
            res.redirect("/admin/m_support?page=1");
        });
    } catch (error) {
        res.send(error.message);
    }
});

//후원광고 수정폼 이동
router.get('/supportUdtForm', async (req, res) => {
    try {
        const param = req.query.supportId;
        const sql = "select s.*, f.* from support s join file f on s.supportId = f.supportId where s.supportId = ?"
        connection.query(sql, param, function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_support/support_udtForm';
            res.render(route, {
                result: result
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//후원 수정
router.post('/supportUpdate', upload.array('file'), async (req, res) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    var param = [req.body.supportUrl, req.body.supportTitle, req.body.supportDetail, req.body.supportId];
    sql = "update support set supportUrl = ?, supportTitle = ?,\
                supportDetail = ? where supportId = ?";
    connection.query(sql, param, (err) => {
        if (err) {
            console.error(err);
        }
        for (let i = 0; i < paths.length; i++) {
            const sql2 = "insert into file(fileRoute, fileOrgName, supportId) values (?, ?, ?)";
            const param2 = [paths[i], orgName[i], req.body.supportId];
            connection.query(sql2, param2, (err) => {
                if (err) {
                    throw err;
                }
            });
        };
        res.redirect('/admin/m_support');
    });
});

//후원 이미지 파일 삭제
router.get('/supportImgDelete', async (req, res) => {
    const param = req.query.fileId;
    const fileRoute = req.query.fileRoute; 
    try {
        const sql = "delete from file where fileId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err)
            }
            fs.unlinkSync(fileRoute.toString(), (err) => {
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
    res.redirect('back');
});

//후원광고 삭제
router.get('/supportDelete', async (req, res) => {
    try {
        const param = [req.query.supportId, req.query.supportId];
        const sql = "delete from support where supportId = ?;\
                        delete from file where supportId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log("쿼리 에러입니다.");
            }
            if (req.query.fileRoute != undefined) {
                if (Array.isArray(req.query.fileRoute) == false) {
                    req.query.fileRoute = [req.query.fileRoute];
                }
                for (let i = 0; i < req.query.fileRoute.length; i++) {
                    fs.unlinkSync(req.query.fileRoute[i], (err) => {
                        if (err) {
                            console.log(err);
                        }
                        return;
                    });
                }
            }
            res.redirect("/admin/m_support");
        });
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;