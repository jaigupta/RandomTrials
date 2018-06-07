var mongoose = require('mongoose');

module.exports = mongoose.model(
  'User', {
    facebookID: String,
    displayName: String,
    googleID: String,
    imageUrl: String,
    googleRefreshToken: String,
  }
);
