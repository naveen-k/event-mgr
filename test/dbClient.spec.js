/* jshint -W024, -W101, -W079, -W098 -W031 */
/* jshint expr:true */
'use strict';

const should = require('chai').should();
const models = require('irvui-express-cassandra');
var DbClient = require('../lib/dbClient');
var config = require('./config');

describe('Database Connection', function() {
  var db = new DbClient();
  it('should connect and sync with db without errors', function (done) {
    this.timeout(5000);
    this.slow(1000);
    db.connect(config.db, function(err, db) {
      (err === null).should.be.true;
      done();
    });
  });
});