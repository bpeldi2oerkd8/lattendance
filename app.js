var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var validator = require('validator');

// モデルの読み込み
var User = require('./models/user');
var Schedule = require('./models/schedule');
var Availability = require('./models/availability');
var Dates = require('./models/date');
var Room = require('./models/room');
User.sync().then(() => {
  Room.sync().then(() => {
    Schedule.belongsTo(User, {foreignKey: 'createdBy'});
    Schedule.belongsTo(Room, {foreignKey: 'roomId'});
    Schedule.sync();
    Availability.belongsTo(User, {foreignKey: 'userId'});
    Dates.sync().then(() => {
      Availability.belongsTo(Dates, {foreignKey: 'dateId'});
      Availability.sync();
    });
  });
});

var BASIC_USER_ID = process.env.BASIC_USER_ID || require('./secret_info/basic_info').BASIC_USER_ID;
var BASIC_PASSWORD = process.env.BASIC_PASSWORD || require('./secret_info/basic_info').BASIC_PASSWORD;

var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || require('./secret_info/github_info').GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || require('./secret_info/github_info').GITHUB_CLIENT_SECRET;

var session_info = process.env.SESSION_INFO || require('./secret_info/session_info');

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new BasicStrategy({
  passReqToCallback: true
},
  function(req, userid, password, done) {
    if (userid === BASIC_USER_ID && password === BASIC_PASSWORD) {
      // すでにログインしている場合はそのユーザー情報、そうでない場合は認証成功を知らせるためtrueを返す
      const user = req.user ? req.user : true;
      return done(null, user);
    } else {
      return done(null, false);
    }
  }
));

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/github/callback' : 'http://localhost:8000/auth/github/callback'
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      const userId = profile.id;
      const userName = profile.username;

      User.findOne({
        where: {
          userId: userId
        }
      }).then((user) => {
        if(user) {
          user.userName = userName;
          user.save();
        }
        done(null, profile);
      });
    });
  }
));

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var slackIdRegisterRouter = require('./routes/slack-id-register');
var schedulesRouter = require('./routes/schedules');
var slackChannelLinkRouter = require('./routes/slack-channel-linker');
var availabilitiesRouter = require('./routes/availabilities');
var availabilities2Router = require('./routes/v1/availabilities2');
var apiLoginRouter = require('./routes/v1/api-login');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: session_info, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/slack-id-register', slackIdRegisterRouter);
app.use('/schedules', schedulesRouter);
app.use('/schedules', availabilitiesRouter);
app.use('/schedules/slack-channel-linker', slackChannelLinkRouter);
app.use('/api/v1/schedules', availabilities2Router);
app.use('/api/v1/login', apiLoginRouter);

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
});

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    User.findOne({
      where: {
        userId: req.user.id
      }
    }).then((user) => {
      if(user) {
        var loginFrom = req.cookies.loginFrom;
        var scheduleId = loginFrom ? loginFrom.split('/schedules/')[1] : '';
        // オープンリダイレクタ脆弱性対策
        if (loginFrom && scheduleId && validator.isUUID(scheduleId)) {
          res.clearCookie('loginFrom');
          res.redirect('/schedules/' + scheduleId);
        } else {
          res.redirect('/');
        }
      } else {
        res.redirect('/slack-id-register');
      }
    });
});

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

module.exports = app;
