'use strict';
const models = require('irvui-express-cassandra');

var database = function() {
  var self = this;

  self.connect = function(config, done) {
    models.setDirectory(__dirname + '/entities').bind(
      {
        clientOptions: {
          contactPoints: [config.host],
          protocolOptions: { port: config.port },
          keyspace: config.keyspace,
          queryOptions: { consistency: models.consistencies.one }
        },
        ormOptions: {
          defaultReplicationStrategy: {
            class: 'SimpleStrategy',
            replication_factor: 1
          },
          dropTableOnSchemaChange: false,
          createKeyspace: true
        }
      },
      function (err) {
        if(err) done(err, null);
        else done(null, models);
      }
    );
  }
  
  return self;
}

module.exports = database;