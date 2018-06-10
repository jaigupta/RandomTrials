var express = require('express');
var passport = require('passport');
var FB = require('fb');
var googleConfig = require('../config/google');
var google = require('googleapis').google;
var router = express.Router()

router.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
}

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/signout', router.isAuthenticated, function(req, res) {
  req.logOut();
  res.redirect('/');
});

router.get('/facebook', passport.authenticate('facebook'));
router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/login'
  }),
  function(req, res) {
    res.send('Facebook login succeeded! Welcome ' + req.user.displayName);
  });

router.get('/google', passport.authenticate('google', {
  scope: [
    'profile',
    'https://www.googleapis.com/auth/drive',
    'https://mail.google.com/'
  ]
}));
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login'
  }),
  function(req, res) {
    console.log(req);
    res.redirect('/auth/profile');
  });


module.exports = router;
