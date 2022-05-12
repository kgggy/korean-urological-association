var express = require('express');
var router = express.Router();

// DB 커넥션 생성
var connection = require('../../config/db').conn;

//신고 전체조회
router.get('/blameAll', async (req, res) => {
    try {
        var page = req.query.page;
        var targetType = req.query.targetType == undefined ? "" : req.query.targetType;
        var sql = "select b.* ,date_format(blaDate, '%Y-%m-%d') as blaDatefmt, c.boardId,\
                          (select count(*) from blame where b.targetContentId = n.noticeId) as noticeyn,\
                          (select count(*) from blame where b.targetContentId = r.referId) as referyn,\
                          (select count(*) from blame where b.targetContentId = g.galleryId) as galleryyn\
                    from blame b left join comment c on c.cmtId = b.targetContentId\
               left join notice n on b.targetContentId = n.noticeId\
               left join reference r on b.targetContentId = r.referId\
               left join gallery g on b.targetContentId = g.galleryId where 1=1";
        if (targetType != '') {
            sql += " and targetType = " + targetType;
        }
        sql += " order by 1 desc"
        connection.query(sql, (err, results) => {
            var countPage = 10; //하단에 표시될 페이지 개수
            var page_num = 10; //한 페이지에 보여줄 개수
            var last = Math.ceil((results.length) / page_num); //마지막 장
            var endPage = Math.ceil(page / countPage) * countPage; //끝페이지(10)
            var startPage = endPage - countPage; //시작페이지(1)
            if (err) {
                console.log(err);
            }

            if (last < endPage) {
                endPage = last
            };
            let route = req.app.get('views') + '/m_blame/blame';
            res.render(route, {
                results: results,
                page: page, //현재 페이지
                length: results.length - 1, //데이터 전체길이(0부터이므로 -1해줌)
                page_num: page_num,
                countPage: countPage,
                startPage: startPage,
                endPage: endPage,
                pass: true,
                last: last, 
                targetType: targetType
            });
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//신고 여러개 삭제
router.get('/blameDelete', (req, res) => {
     const param = req.query.blameId;
     const page = req.query.page;
     const str = param.split(',');
    //  console.log(str)
    for (var i = 0; i < str.length; i++) {
        const sql = "delete from blame where blaId = ?";
        connection.query(sql, str[i], (err, result) => {
            if (err) {
                console.log(err)
            }
        });
    }
    res.send('<script>alert("신고내역이 처리되었습니다."); location.href="/admin/m_blame/blameAll?page=1";</script>');
});

//게시글, 댓글 상세보기
// router.get('/detail', (req, res) => {
//     try {
//         const param = req.query.targetType;
//         var sql = "";
//         if (param == '0') {
//             //게시글
//             // sql = "select *, (select boardName from boardDiv where d.boardDivId = boardDiv.boardDivId) as boardName, d.crewDiv, date_format(boardDate, '%Y-%m-%d') as boardDateFmt\
//             //          from blame b\
//             //     left join board d on d.boardId = b.targetContentId\
//             //     left join file f on b.targetContentId = f.boardId\
//             //         where b.targetType = ?";
//             sql = "select * from notice where noticeId = 'n1'";
//         } else {
//             //댓글
//             sql = "select date_format(cmtDate, '%Y-%m-%d') as cmtDateFmt, b.blameDiv,\
//                                 b.targetUserName, b.uid, c.cmtId, c.cmtContent, c.cmtDate from blame b\
//                       left join comment c on c.cmtId = b.targetContentId\
//                           where b.targetType = ?";
//         }
//         connection.query(sql, (err, result) => {
//             if (err) {
//                 console.log(err);
//             }
//             let route = req.app.get('views') + '/m_blame/blameDetail';
//             res.render(route, {
//                 result: result,
//                 targetType: param
//             });
//         })

//     } catch (error) {
//         res.status(401).send(error.message);
//     }
// });

module.exports = router;