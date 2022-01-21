const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
//require("dotenv").config();

const routes = require('./routes');
const router = require('./routes/api/login');

const app = express(); //express 패키지 호출, app변수 객체 생성. => app객체에 기능 하나씩 연결.

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

//app.use => 미들웨어 연결
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // css 연결
// app.use(express.static(path.join(__dirname, 'views'))); // html 연결
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(expressLayouts);


// 화면 engine을 ejs로 설정 pug, ejs (x)
app.set('layout', 'layout');
app.set("layout extractScripts", true);
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
// app.engine('html', require('ejs').renderFile);
// app.set('views', __dirname + '/views/ejs');   //view 경로 설정
app.set('views', path.join(__dirname, '/views/ejs'));



// admin html
const ejs = "/views/ejs"
const admin = "/admin"

app.get(admin, (req, res) => { res.sendFile(__dirname + "/views/index.html"); })
// app.post(admin, (req, res) => { res.sendFile(__dirname + "/views/index.html"); })
// app.get(admin + "orgm_list", (req, res) => { res.render(__dirname + ejs + "orgm_viewForm.ejs"); }) // 랜더링 필요하기 때문에 sendfile 대신 render 써줘야함
app.get(admin + "/memberList", (req, res) => { res.render(__dirname + ejs + "/memberList.ejs"); })
app.post(admin + "/memberList", (req, res) => { res.render(__dirname + ejs + "/memberList.ejs"); })
// app.get(admin, (req, res) => { res.render(__dirname + ejs + "index.ejs"); });
// app.get("/admin/orgm_list", (req, res) => { res.sendFile(__dirname + admin + "orgmember_mngt/orgm_listForm.html"); })
//router.get('/admin/web', (req, res, next) => { res.render(__dirname + admin + "index.ejs");})


app.use('/', routes);

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
  res.render('error');
});

module.exports = app; //app객체를 모듈로 만듦(bin/www에서 사용된 app모듈)
