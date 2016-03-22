'use strict';

var Emitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var Verror = require('verror');
var bunyan = require('bunyan');
var DbClient = require('./dbClient');
var Model = require('./models');


var log = bunyan.createLogger({
  name        : 'EventService',
  level       : process.env.LOG_LEVEL || 'info',
  stream      : process.stdout,
  serializers : bunyan.stdSerializers
});



var Service = function(configuration) {
  Emitter.call(this);
  var self = this;
  var continueWith = null;
  var db = new DbClient();
  var config = configuration;
  var Table, closedb = null;

  if(!config) {
    config = {};
    config.db = {};
    config.db.host = process.env.DB_HOST || '192.168.99.100';
    config.db.port = process.env.DB_PORT || '9042';
    config.db.keyspace = process.env.DB_KEYSPACE || 'smartcity';
  }

  log.debug('Service Initialized', 'EventService()');
  log.info(config, 'EventService.config');

  //////////////////////// INITIALIZATION DONE

  var countItems = function(params) {
    var query = 'SELECT COUNT(*) FROM event;';

     Table.execute_query(query, null, function(err, result) {
      if(err) return self.emit('send-error', err, 'Failed to Get Count');

      params.length = result.rows[0].count.toNumber();
      return self.emit('list-events', params);
     });
  };

  // CREATE
  var createEvent = function(params) {
    var errorMsg = 'DB Save Failure';
    var dto = new Model.Event(params);
    var valid = dto.isValid();

    if(valid !== null) return self.emit('send-error', valid, 'Invalid Object');

    var row = new Table(dto);
    row.save(function(err) {
      if(err) return self.emit('send-error', new Verror(err, 'CREATEEVENTFAILURE'), errorMsg);

      return self.emit('send-data', dto);
    });
  };



  // DELETE
  var clearEvents = function(params) {
    var errorMsg = 'DB Delete Failure';

    var filter = { group_id: params.group_id };
    if (params.category) filter.category = params.category;
    //if (params.date) filter.date = params.date;
    Table.find(filter, {allow_filtering: true},function(err, rows) {
      if(err) return self.emit('send-error', new Verror(err, 'DELETEEVENTFAILURE'), errorMsg);

      let list = [];
      if(rows.length== 0) {
          return self.emit('send-error', new Verror(err, 'NO DATA'), errorMsg);
      } else {
          for(var row of rows) {
            row.delete(function(err) {
            if(err) {
                return self.emit('send-error', new Verror(err, 'DELETEEVENTFAILURE'), errorMsg);
            }
            list.push({id: row.id});
            if(list.length === rows.length) {
                return self.emit('send-data', list);
            }
          });
        }
      }
    });
  };


  // Get List from the Database for all group 
  var listItems = function(params) {
    var pageResult = new Model.PageResult();

    if(params.pageIndex === undefined || params.pageIndex === null) {
      params.pageIndex = 0;
    }
    if(params.pageSize === undefined || params.pageSize === null) {
      params.pageSize = 50;
    }
    pageResult.currentPage = parseInt(params.pageIndex);
    pageResult.pageSize = parseInt(params.pageSize);

    pageResult.events = [];

    let filter = {
      $limit: parseInt(params.pageSize),
      $skip: (params.pageSize) * parseInt(params.pageIndex) || 0
      //group_id: params.group_id || config.group
    }
    if (params.category) filter.category = params.category;
    if (params.group_id) {
      filter.group_id = params.group_id;
      if (params.date) 
        filter.date = params.date;
      if (params.description) 
        filter.description = params.description;
    }

    //Math.ceil -- Always rounds up
    pageResult.pages = Math.ceil(pageResult.count / filter.$limit);


    Table.find(filter,{raw:true, allow_filtering: true}, function(err, rows){
      if(err) return self.emit('send-error', err, 'Failed to Get Event List');
      pageResult.count = rows.length;
      for(var row of rows) {
        pageResult.events.push(new Model.Event(row));
      }
      return self.emit('send-data', pageResult);
    });
  };

  // Create an Okay Result
  var sendData = function(data) {
    var result = new Model.Response();
    result.success = true;
    result.message = 'Success';
    result.data = data;
    log.debug(result, 'EventService.sendData() received');

    if(continueWith) {
      continueWith(null, result);
    }
  };

  // Create a Bad Result
  var sendError = function(error, message) {
    var result = new Model.Response();
    result.success = false;
    result.message = message;
    log.error(error, 'EventService.sendError');

    if(continueWith) {
      continueWith(null, result);
    }
  };


  var openConnection = function(eventHandler, args) {
    log.debug('DB Connection Open', 'EventService.openConnection()');
    var errorMsg = 'DB Connection Failure';

    db.connect(config.db, function(err, db) {
      if(err || db.instance.Event === undefined) {
        return self.emit('send-error', new Verror(err, 'ECONNREFUSED'), errorMsg);
      }
      closedb = db.close;
      Table = db.instance.Event;

      Table.find({}, function(err, result) {
        if(err) {
          return self.emit('send-error', new Verror(err, 'DBQUERYERR'), errorMsg);
        }

        if(result.length === 0) {
          log.debug('Seeding the Database', 'EventService.openConnection()');

          let data = require('./seed.json');
          let count = 0;

          for (var value of data) {
            var model = new Table(new Model.Event(value));
            model.save(function(err){
              if(err) {
                return self.emit('send-error', new Verror(err, 'DBSEEDDATA'), errorMsg);
              }
              count++;
              if(count === data.length) {
                return self.emit(eventHandler, args);
              }
            });
          }
        } else {
          return self.emit(eventHandler, args);
        }
      });
    });
  };

  /////////////////////////////////////////

  self.create = function(input, done) {
    log.debug({input: input}, 'EventService.create()');
    continueWith = done;
    openConnection('create-event', input);
  };
  self.delete = function(input, done) {
    log.debug({input: input}, 'EventService.delete()');
    continueWith = done;
    openConnection('delete-event', input);
  };
  self.list = function(input, done) {
    log.debug({input: input}, 'EventService.list()');
    continueWith = done;
    openConnection('count-events', input);
  };
  self.close = function() {
    log.debug('DB Connection Close', 'EventService.close()');
    closedb();
  };


  // Event Wireup
  self.on('count-events', countItems);
  self.on('create-event', createEvent);
  self.on('list-events', listItems);
  self.on('delete-event', clearEvents);
  self.on('send-data', sendData);
  self.on('send-error', sendError);

  return self;
};

util.inherits(Service, Emitter);
module.exports = Service;
