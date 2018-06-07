var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var session = require('express-session');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var dbConfig = require('./config/db');
var User = require('./models/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({secret: 'test', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
    clientID: '177711686272026',
    clientSecret: '1db94105ede10ab7b63aa1496b0c32f9',
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  }, function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    var user = new User({facebookId: profile.id, displayName: profile.displayName});
    user.save(function(err) {
      console.log(err);
      console.log(JSON.stringify(user));
      cb(err, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.facebookId);
});

passport.deserializeUser(function(id, done) {
  User.findOne({facebookId: id}, function(err, user) {
    console.log('Found user: ' + user);
    done(err, user);
  });
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

mongoose.connect(dbConfig.url);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


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
