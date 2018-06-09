var createError = require('http-errors');
var express = require('express');
var path = require('path');
var dotenv = require('dotenv').config();
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var session = require('express-session');
var mongoose = require('mongoose');
const google = require('googleapis').google;
const googleConfig = require('./config/google');
const fbConfig = require('./config/fb');
const dbConfig = require('./config/db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var User = require('./models/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
lpp.use(cookieParser());
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(session({
  secret: 'test',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
  clientID: FB_CLIENT_ID,
  clientSecret: FB_CLIENT_SECRET,
  callbackURL: FB_CALLBACK_URL
}, function(accessToken, refreshToken, profile, cb) {
  FB.setAccessToken(accessToken);
  console.log(profile);
  var user = new User({
    facebookID: profile.id,
    displayName: profile.displayName
  });
  user.save(function(err) {
    console.log(err);
    console.log(JSON.stringify(user));
    cb(err, user);
  });
}));

passport.use(new GoogleStrategy({
    clientID: googleConfig.clientID,
    clientSecret: googleConfig.clientSecret,
    callbackURL: googleConfig.callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOne({
      googleID: profile.id
    }, function(err, user) {
      if (!user) {
        var imageUrl = '';
        if (profile.photos.length > 0) {
          imageUrl = profile.photos[0].value;
        }
        var user = new User({
          facebookID: 'UNKNOWN',
          googleID: profile.id,
          displayName: profile.displayName,
          imageUrl: imageUrl
        });
        user.save(function(err) {
          cb(err, user);
        });
      } else {
        cb(err, user);
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, 'g-' + user.googleID);
});

passport.deserializeUser(function(id, done) {
  var query = {};
  if (id.startsWith('g-')) {
    query.googleID = id.substring(2, id.length);
  } else if (id.startsWith('f-')) {
    query.facebookID = id.substring(2, id.length);
  }
  User.findOne(query, function(err, user) {
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
