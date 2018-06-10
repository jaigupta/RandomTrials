var google = require('googleapis').google;

var config = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
};

config.createOAuthClient = function() {
  return new google.auth.OAuth2(
    config.clientID,
    config.clientSecret,
    config.callbackURL);
};


module.exports = config;
