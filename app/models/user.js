var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  defaults: {
    // userId
    // sessionId
    loggedIn: false
  },
  initialize: function() {
    this.on('add', function (model, attrs, options){
      console.log('model ', model);
      console.log('attrs', attrs);
      console.log('options ', options);
    });
  }

});

module.exports = User;
