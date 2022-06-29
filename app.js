const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const ejs = require('ejs');
//require("dotenv").config();
const session = require('express-session');

const app = express(); //express 패키지 호출, app변수 객체 생성. => app객체에 기능 하나씩 연결.

const routes = require('./routes');
const adminRoutes = require('./routes/admin_api');

//app.use => 미들웨어 연결
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // css 연결
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(expressLayouts);

// 세션 설정
app.use(                                // request를 통해 세션 접근 가능 ex) req.session
	session({
		// key: "loginData",
		secret: "keyboard cat",   // 반드시 필요한 옵션. 세션을 암호화해서 저장함
		resave: false,          // 세션 변경되지 않아도 계속 저장됨. 기본값은 true지만 false로 사용 권장
		saveUninitialized: true,       // 세션을 초기값이 지정되지 않은 상태에서도 강제로 저장. 모든 방문자에게 고유 식별값 주는 것.
    cookie: { maxAge : 3600000 },
    rolling : true
		// store: new MYSQLStore(connt),
	})
);
app.use(function (req, res, next) {
  if (req.session.user) {
    global.sessionAdminId = req.session.user.adminId;
    global.firstAdmin = req.session.user.adminId;
  } else {
    global.fisrtAdmin = '';
  }
  // global.version = "1.0.8"; //최신 업데이트 버전
  next();
});

// 화면 engine을 ejs로 설정
app.set('layout', '../layout/layout');
app.set("layout extractScripts", true);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
// app.engine('ejs', require('ejs').__express);
// app.engine('html', require('ejs').renderFile);
// app.set('views', __dirname + '/views/ejs');   //view 경로 설정
app.set('views', path.join(__dirname, '/views/ejs'));
app.set('error', __dirname);


// app.get('/', (req, res) => { res.render(__dirname + "/views/ejs/index.ejs", {layout:false}) })
// app.get('/', (req, res) => {
//   res.redirect('/admin');
// })
app.get("/", async (req, res) => {
  try {
	  var sql = "select * from support";
	  connection.query(sql, (err, results) => {
			if (err) {
				console.log(err);
			}
			let route = req.app.get('views') + '/userEjs/index.ejs';
			res.render(route, {results: results, layout: false});
		});
	} catch (error) {
		res.status(500).send(error.message);
	}

})
app.get("/greeting/web", (req, res) => {
	var sql = "select * from greeting where id = 1";
	  connection.query(sql, (err, results) => {
			if (err) {
				console.log(err);
			}
			let route = req.app.get('views') + '/userEjs/sub1/greeting.ejs';
			res.render(route, {results: results, layout: false});
		});
})
app.get("/rules", (req, res) => {
	var sql = "select * from greeting where id = 3";
	var fileSql = "select * from file where fileId = 1";
	let file;
	connection.query(fileSql, (err, results) => {
		if (err) {
			console.log(err);
		}
		file = results;
		const fileRoute = file[0].fileRoute;
		const fileName = file[0].fileOrgName;
		connection.query(sql, (err, results) => {
			if (err) {
				console.log(err);
			}
			let route = req.app.get('views') + '/userEjs/sub2/rules.ejs';
			res.render(route, {
				results: results,
				fileRoute: fileRoute,
				fileOrgName : fileName,
				layout: false
			});
		});
	});
})
app.get("/tree", (req, res) => {
	var sql = "select * from tree t left join user u on u.uid = t.uid";
	connection.query(sql, (err, results) => {
		if (err) {
			console.log(err);
		}
		let route = req.app.get('views') + '/userEjs/sub3/tree.ejs';
		res.render(route, {
			results: results,
			layout: false
		});
	});
})
app.get("/support/web", (req, res) => {
	var sql = "select * from support";
	connection.query(sql, (err, results) => {
		if (err) {
			console.log(err);
		}
		let route = req.app.get('views') + '/userEjs/sub4/support.ejs';
		res.render(route, {
			results: results,
			layout: false
		});
	});
})
app.get("/support/detail", (req, res) => {
	var sql = "select * from support s left join file f on f.supportId = s.supportId where s.supportId = ?;";
	const param = req.query.supportId;
	connection.query(sql, param, (err, result) => {
		if (err) {
			console.log(err);
		}
		let route = req.app.get('views') + '/userEjs/sub4/support_detail.ejs';
		res.render(route, {
			result: result,
			layout: false
		});
	});
})
// 이전페이지
app.get('/support/previous', async (req, res) => {
    try {
        const param = req.query.supportId;
        const sql = "select supportId from support\
                        where supportId in (select *\
                        from(SELECT supportId FROM support WHERE supportId < ? ORDER BY supportId DESC LIMIT 1) as t)";
        connection.query(sql, param, (err, result) => {
            for (var i = 0; i < result.length; i++) {
                result = result[i].supportId
            }
            if (result.length == 0) {
                return res.send('<script>alert("이전 글이 없습니다"); location.href = document.referrer;</script>');
            }

            if (err) {
                return res.send('<script>alert("이전 글이 없습니다"); location.href = document.referrer;</script>');
            }

            res.redirect('/support/detail?supportId=' + result);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});
// 다음페이지
app.get('/support/next', async (req, res) => {
    try {
        const param = req.query.supportId;
        const sql = "select supportId from support\
                        where supportId in (select *\
                        from(SELECT supportId FROM support WHERE supportId > ? ORDER BY supportId LIMIT 1) as t)";
        connection.query(sql, param, (err, result) => {
            for (var i = 0; i < result.length; i++) {
                result = result[i].supportId
            }
            if (result.length == 0) {
                return res.send('<script>alert("다음 글이 없습니다"); location.href = document.referrer;</script>');
            }

            if (err) {

                return res.send('<script>alert("다음 글이 없습니다"); location.href = document.referrer;</script>');
            }

            res.redirect('/support/detail?supportId=' + result);
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});


app.use('/', routes);
app.use('/admin',adminRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {layout: false});
});

module.exports = app; //app객체를 모듈로 만듦(bin/www에서 사용된 app모듈)
