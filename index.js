var path = require('path');
var express = require('express');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var flash = require('connect-flash');
var config = require('config-lite');
var routes = require('./routes');
var pkg = require('./package');
//log
var winston = require('winston');
var expressWinston = require('express-winston');

// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');



var app = express();

// express@3.2.2
// var SessionStore = require("session-mongoose")(express);
// var store = new SessionStore({
// url: "mongodb://localhost/session",
// interval: 120000
// });
// app.use(express.session({
// secret : 'fens.me',
// store: store,
// cookie: { maxAge: 900000 }
// }));

// // 加载路由控制
// var routes = require('./routes/index');


// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

// // 定义icon图标
// app.use(favicon(__dirname + '/public/favicon.ico'));
// // 定义日志和输出级别
// app.use(logger('dev'));
// // 定义数据解析器
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// // 定义cookie解析器
// app.use(cookieParser());

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
// session 中间件
app.use(session({
  name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true,// 强制更新 session
  saveUninitialized: false,// 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({// 将 session 存储到 mongodb
    url: config.mongodb// mongodb 地址
  })
}));
// flash 中间件，用来显示通知
app.use(flash());

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'),// 上传文件目录
  keepExtensions: true// 保留后缀
}));



// // 匹配路径和路由
// app.use('/', routes);



// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});


// // 路由
// routes(app);
// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));

// 路由
routes(app);
// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));




// error page//错误逻辑
app.use(function (err, req, res, next) {
  res.render('error', {
    error: err
  });
});




// // 监听端口，启动程序
// app.listen(config.port, function () {
//   console.log(`${pkg.name} listening on port ${config.port}`);
// });


//测试
//直接启动 index.js 则会监听端口启动程序，如果 index.js 被 require 了，则导出 app，通常用于测试。
if (module.parent) {
  module.exports = app;
} else {
  // 监听端口，启动程序
  app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`);
  });
}


// // 404错误处理
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// // 开发环境，500错误处理和错误堆栈跟踪
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

// // 生产环境，500错误处理
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });

// // 输出模型app
// module.exports = app;