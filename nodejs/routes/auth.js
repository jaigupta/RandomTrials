var express = require('express');
var passport = require('passport');
var FB = require('fb');

var router = express.Router();

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
}

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/signout', isAuthenticated, function(req, res) {
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
  scope: ['profile']
}));
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.send('Google login succeeded! Welcome ' + req.user.displayName);
  }
);

module.exports = router;
