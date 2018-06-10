var express = require('express');
var router = express.Router()
var googleConfig = require('../config/google');
var google = require('googleapis').google;
var auth = require('./auth');

router.get('/list', auth.isAuthenticated, function(req, res) {
  var googleOAuthClient = googleConfig.createOAuthClient();
  googleOAuthClient.setCredentials({
    refresh_token: req.user.googleRefreshToken
  });
  const gmail = google.gmail({
    version: 'v1',
    auth: googleOAuthClient
  });
  gmail.users.threads.list({
    userId: 'me'
  }, {}).then(function(gmailRes) {
    var gmailThreads = gmailRes.data.threads;
    res.render('pages/gmail/list', {
      gmailThreads: gmailThreads
    });
  }).catch(function(err) {
    res.send(err.toString());
  });
});

module.exports = router;
