var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  defaults: {
  },
  initialize: function() {
    this.on('add', this.logger, this);
  },

  logger: function (model, attrs, options){
    // console.log('model ', model);
    // console.log('attrs', attrs);
    // console.log('options ', options);
    // Maybe set the state for the login ??
  }

});

module.exports = User;
