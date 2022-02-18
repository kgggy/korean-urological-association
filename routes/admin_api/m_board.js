var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const fs = require('fs');

const multer = require("multer");
const path = require('path');


const connt = require("../../config/db")
var url = require('url');

const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;

const {
    v4: uuidv4
} = require('uuid');

const uuid = () => {
    const tokens = uuidv4().split('-');
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4]
}

// DB 커넥션 생성
var connection = mysql.createConnection(connt);
connection.connect();

//파일업로드 모듈
var upload = multer({ //multer안에 storage정보  
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            //파일이 이미지 파일이면
            if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "application/octet-stream") {
                // console.log("이미지 파일입니다.");
                callback(null, 'uploads/boardImgs');
                //텍스트 파일이면
            } else {
                // console.log("텍스트 파일입니다.");
                callback(null, 'uploads/boardTexts');
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

//파일 다운로드
router.get('/download', (req, res) => {
    const fileName = '';
    filepath = __dirname + '../..//uploads/'
    console.log(filepath);
})

//커뮤니티 종류
router.get('/', async (req, res) => {
    try {
        let community;
        const sql = "select * from community";
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            community = results;
            res.status(200).json(community);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//카테고리별 글 전체조회
router.get('/all', async (req, res) => {
    try {
        var page = req.query.page;
        const param = req.query.boardId;
        const sql = "select p.*, c.*, u.userNick, u.uid, date_format(writDate, '%Y-%m-%d') as writDatefmt, date_format(writUpdDate, '%Y-%m-%d') as writUpdDatefmt\
                       from post p\
                  left join community c\
                         on c.boardId = p.boardId\
                  left join user u\
                         on u.uid = p.uid\
                      where p.boardId = ?\
                      order by p.writRank is null asc, nullif(p.writRank, '') is null asc, p.writRank, p.writDate desc";
        connection.query(sql, param, (err, results) => {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_board/board';
            res.render(route, {
                searchType: null,
                searchText: null,
                results: results,
                page: page,
                length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
                page_num: 15, //한 페이지에 보여줄 개수
                pass: true
            });
            console.log(page)
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//각 커뮤니티별 글 상세조회
router.get('/selectOne', async (req, res) => {
    try {
        const param = req.query.writId;
        const sql = "select p.*, f.fileRoute, f.fileOrgName, f.fileNo, u.userNick, date_format(writDate, '%Y-%m-%d') as writDatefmt, date_format(writUpdDate, '%Y-%m-%d') as writUpdDatefmt\
                        from post p\
                   left join file f on f.writId = p.writId\
                   left join user u on u.uid = p.uid\
                       where p.writId = ?";

        connection.query(sql, param, (err, result) => {
            if (err) {
                res.json({
                    msg: "select query error"
                });
            }
            let route = req.app.get('views') + '/m_board/brd_viewForm';
            res.render(route, {
                'result': result,
                layout: false
            });
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 삭제
router.get('/brdDelete', async (req, res) => {
    try {
        const param = req.query.writId;
        const fileRoute = req.query.fileRoute;
        const sql = "delete from post where writId = ?";
        connection.query(sql, param, (err, row) => {
            if (err) {
                console.log(err);
                res.json({
                    msg: "query error"
                });
            }
            if (fileRoute != '') {
                fs.unlinkSync(fileRoute, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    return;
                });
            }
            res.send("<script>opener.parent.location.reload(); window.close();</script>");
        });
    } catch (error) {
        res.send(error.message);
    }
});

//게시글 등록 폼 이동
router.get('/writForm', async (req, res) => {
    fs.readFile('views/ejs/m_board/brd_writForm.ejs', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.end(data);
        }
    });
});

//게시글 수정 폼 이동
router.get('/brdUdtForm', async (req, res) => {
    try {
        const param = req.query.writId;
        const sql = "select p.*, f.fileRoute, f.fileOrgName, f.fileNo, u.userNick, date_format(writDate, '%Y-%m-%d') as writDatefmt, date_format(writUpdDate, '%Y-%m-%d') as writUpdDatefmt\
                       from post p\
                  left join file f on f.writId = p.writId\
                  left join user u on u.uid = p.uid\
                      where p.writId = ?";
        connection.query(sql, param, function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            let route = req.app.get('views') + '/m_board/brd_udtForm';
            console.log(route);
            res.render(route, {
                'result': result,
                layout: false
            });
            console.log(result);
        });

    } catch (error) {
        res.status(401).send(error.message);
    }
});

//게시글 수정
router.post('/brdUpdate', async (req, res) => {
    try {
        const param = [req.body.writTitle, req.body.writContent, req.body.writRank, req.body.writRank, req.body.writId];
        const sql1 = "update post set writTitle = ?, writContent = ?, writUpdDate = sysdate(), writRank = if(trim(?)='', null, ?) where writId = ?";
        connection.query(sql1, param, (err, row) => {
            if (err) {
                console.error(err);
                res.send('<h1>쿼리 오류입니다...</h1>');
            }
            res.redirect('selectOne?writId=' + req.body.writId);
        });
    } catch (error) {
        res.send(error.message);
    }
});

//게시글 작성 및 파일첨부
router.post('/boardwrite', upload.array('file'), async (req, res, next) => {
    const paths = req.files.map(data => data.path);
    const orgName = req.files.map(data => data.originalname);
    console.log(req.body);
    console.log(req.files);
    try {
        const boardWritId = uuid();
        // req.body.writRank = parseInt(req.body.writRank);
        const param1 = [boardWritId, req.body.boardId, req.body.uid, req.body.writTitle, req.body.writContent, req.body.writRank];
        const sql1 = "insert into post(writId, boardId, uid, writTitle, writContent, writRank) values(?, ?, ?, ?, ?, if(writRank,?,null))";
        connection.query(sql1, param1, (err, row) => {
            if (err) {
                throw err;
            }
            for (let i = 0; i < paths.length; i++) {
                const param2 = [boardWritId, paths[i], i, orgName[i]];
                // console.log(param2);
                const sql2 = "insert into file(writId, fileRoute, fileNo, fileOrgName) values (?, ?, ?, ?)";
                connection.query(sql2, param2, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            };
        });
        res.send("<script>opener.parent.location.reload(); window.close();</script>");
    } catch (error) {
        res.send(error.message);
    }
});

//첨부파일 삭제
router.get('/fileDelete', async (req, res) => {
    const param = [req.query.writId, req.query.fileNo];
    const fileRoute = req.query.fileRoute;
    // console.log(fileRoute + "-------" + param);
    try {
        const sql = "delete from file where writId = ? and fileNo = ?";
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
            console.log("프로필 삭제 에러 발생");
        }
    }
    res.redirect('brdUdtForm?writId=' + req.query.writId);
});

// 검색
router.get('/search', async (req, res) => {
    var page = req.query.page;
    var searchType = req.query.searchType;
    var searchText = req.query.searchText;
    if (req.query.searchType == 'writTitle') {
        models.post.findAll({
            include: {
                model: models.user,
                attributes: ['userNick'],
            },
            where: {
                writTitle: {
                    [Op.like]: "%" + searchText + "%"
                },
            },
            attributes: [
                'writRank', 'writTitle', 'writHit', 'user.userNick',
                [sequelize.fn('date_format', sequelize.col('writDate'), '%Y-%m-%d'), 'writDatefmt'],
                [sequelize.fn('date_format', sequelize.col('writUpdDate'), '%Y-%m-%d'), 'writUpdDatefmt']
            ],
            order: [
                ['writDate', 'ASC']
                //order by p.writRank is null asc, nullif(p.writRank, '') is null asc, p.writRank, p.writDate desc
            ],
            raw: true,
        }).then(results => {
            console.log(results);
            let route = req.app.get('views') + '/m_board/board';
            res.render(route, {
                searchText: searchText,
                searchType: searchType,
                results: results,
                page: page,
                length: results.length - 1,
                page_num: 15,
                pass: true
            });

        }).catch(err => {
            console.log(err);
            return res.status(404).json({
                message: 'error'
            });
        })
    } else {
        models.post.findAll({
            include: {
                model: models.user,
                attributes: ['userNick'],
            },
            where: {
                '$user.userNick$': {
                    [Op.like]: "%" + req.query.searchText + "%"
                },
            },
            attributes: [
                'writRank', 'writTitle', 'writHit', 'user.userNick',
                [sequelize.fn('date_format', sequelize.col('writDate'), '%Y-%m-%d'), 'writDatefmt'],
                [sequelize.fn('date_format', sequelize.col('writUpdDate'), '%Y-%m-%d'), 'writUpdDatefmt']
            ],
            order: [
                ['writDate', 'ASC']
            ],
            raw: true,
        }).then(results => {
            let route = req.app.get('views') + '/m_board/board';
            res.render(route, {
                searchText: searchText,
                searchType: searchType,
                results: results,
                page: page,
                length: results.length - 1,
                page_num: 10,
                pass: true
            });
            console.log(results);
        }).catch(err => {
            console.log(err);
            return res.status(404).json({
                message: 'error'
            });
        })
    }

});



module.exports = router;