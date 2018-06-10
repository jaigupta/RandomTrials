var express = require('express');
var router = express.Router()
var googleConfig = require('../config/google');
var google = require('googleapis').google;
var auth = require('./auth');

router.get('/createhelloworld', auth.isAuthenticated, function(req, res) {
  console.log('User: ' + req.user);
  var googleOAuthClient = googleConfig.createOAuthClient();
  googleOAuthClient.setCredentials({
    refresh_token: req.user.googleRefreshToken
  });
  console.log("Refresh Token: " + req.user.googleRefreshToken);
  const drive = google.drive({
    version: 'v3',
    auth: googleOAuthClient
  });
  drive.files.create({
    requestBody: {
      name: 'Test Text file',
      mimeType: 'text/plain'
    },
    media: {
      mimeType: 'text/plain',
      body: 'Hello World'
    }
  }).then(function(driveRes) {
    console.log(driveRes);
    res.send(JSON.stringify(driveRes.data));
  }).catch(function(err) {
    res.send(err.toString());
  });
});

module.exports = router;
