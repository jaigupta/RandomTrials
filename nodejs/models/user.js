var mongoose = require('mongoose');

module.exports = mongoose.model(
  'User', {
    facebookId: String,
    displayName: String
  }
);
