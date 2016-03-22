'use strict';
const Joi = require('joi');
const moment = require('moment');
const Service = require('../lib/service');
const Schema = require('../lib/models').Schema;
const _schema = Schema.Event;
const config = { db: { host: process.env.DB_HOST || "192.168.99.100",
                       port: process.env.DB_PORT || "9042",
                       keyspace: "smartpark" },
                 group: process.env.GRUOP || "CIMCON-DCU-01",
                 default_event_description: "RESERVATION"}

module.exports.routes = [
{
  method: 'GET',
  path: '/api/event/category/{category?}',
  config: {
      plugins: {
        'hapi-io': {
          event: 'get-all-event'
        }
      },
      description: 'Get All Events',
      notes: 'Get All Events',
      tags: ['api'],
      validate: {
          params: {
            category: Joi.string().required().valid(['WARN', 'INFO']),
            pageSize: Joi.number().optional(),
            pageIndex: Joi.number().optional()
          }
          
      }
  },
  handler: function (request, reply) {
    var service = new Service(config);
    var params = {
        category: request.params.category,
        date: moment().utc().format('YYYY-MM-DD')
    }
    console.log("getAllEvent",params);
    service.list(params, function(err, result) {
      if(err) {
        reply({
          statusCode: 500,
          message: err
        });
      } else {
        reply({
          statusCode: 200,
          message: 'successful operation',
          data: result.data
        });
      }
    });
  },
},{
  method: 'GET',
  path: '/api/event/{id}/{description}/{date}',
  config: {
      plugins: {
        'hapi-io': {
          event: 'get-all-event-by-dec'
        }
      },
      description: 'Get All Events by description for group',
      notes: 'Get All Events by description for group',
      tags: ['api'],
      validate: {
          params: {
            id: Joi.string().uppercase().optional().default(config.group_id),
            description: Joi.string().required().default(config.default_event_description),
            date: Joi.date().format('YYYY-MM-DD').raw().default(moment().utc().format('YYYY-MM-DD')).required(),
            pageSize: Joi.number().optional(),
            pageIndex: Joi.number().optional()
          }
          
      }
  },
  handler: function (request, reply) {
    var service = new Service(config);
    var params = {
        group_id: request.params.id,
        description: request.params.description,
        date: request.params.date
    }
    console.log("getAllEvent by category",params);
    service.list(params, function(err, result) {
      if(err) {
        reply({
          statusCode: 500,
          message: err
        });
      } else {
        reply({
          statusCode: 200,
          message: 'successful operation',
          data: result.data
        });
      }
    });
  },
},
{
  method: 'GET',
  path: '/api/event/{id?}',
  config: {
      plugins: {
        'hapi-io': {
          event: 'get-event'
        }
      },
      description: 'Get all Events for a group',
      notes: 'Get an Event',
      tags: ['api'],
      validate: {
          params: {
            id: Joi.string().uppercase().optional().default(config.group),
            pageSize: Joi.number().optional(),
            pageIndex: Joi.number().optional()
          }
          
      }
  },
  handler: function (request, reply) {
    var service = new Service(config);
    var params = {
        group_id: request.params.id,
        date: moment().utc().format('YYYY-MM-DD')
    }
    console.log("getgroupEvent",params);
    service.list(params, function(err, result) {
      if(err) {
        reply({
          statusCode: 500,
          message: err
        });
      } else {
        reply({
          statusCode: 200,
          message: 'successful operation',
          data: result.data
        });
      }
    });
  },
},
{
  method: 'GET',
  path: '/api/event/{id}/{date}',
  config: {
    plugins: {
        'hapi-io': {
          event: 'get-event-bydate'
        }
      },
      description: 'Get all Events for a group',
      notes: 'Get an Event',
      tags: ['api'],
      validate: {
          params: {
            id: Joi.string().uppercase().required(),
            date: Joi.date().format('YYYY-MM-DD').raw().default(moment().utc().format('YYYY-MM-DD')),
            pageSize: Joi.number().optional(),
            pageIndex: Joi.number().optional()
          }
      }
  },
  handler: function (request, reply) { //Action
    var service = new Service(config);
    var query = {
        group_id: request.params.id,
        date: request.params.date
    }
    service.list(query, function(err, result) {
      if(err) {
        reply({
          statusCode: 500,
          message: err
        });
      } else {
        reply({
          statusCode: 200,
          message: 'successful operation',
          data: result.data
        });
      }
    });
  },
},
{
  method: 'POST',
  path: '/api/event/{id?}',
  config: {
      description: 'Add an Event for a group',
      notes: 'Save an Event',
      tags: ['api'],
      validate: {
          params: {
            id: Joi.string().uppercase().optional().default(config.group),
          },
          payload:  {
            category: Joi.string().required().valid(['WARN', 'INFO']),
            description: Joi.string().required().default('SAMPLE_EVENT'),
            options: Joi.object().optional()
          }

      },
      plugins: {
          'hapi-io': 'add-Event'
      }
  },
  handler: function (request, reply) {
    var service = new Service(config);
    
    request.payload.group_id = request.params.id;
    service.create(request.payload, function(err, result) {
      if(err) {
        reply({ statusCode: 500, message:err });
      }
      else {
        if(!result.success) {
          reply({
            statusCode: 500,
            message: result.message
          });
        } else {  
          // Broadcast all connected client for new event added into system with newly addd event data only    
          var io = request.server.plugins['hapi-io'].io;
          io.emit('add-Event',result.data);
          reply({
            statusCode: 200,
            message: 'successful operation',
            event: result.data
          });
        }
      }
    });
}},
{
  method: 'DELETE',
  path: '/api/event/{id}/{category}',
  config: {
      description: 'Clear events for a group',
      notes: 'Clear event table',
      tags: ['api'],
      validate: {
          params: {
            id: Joi.string().uppercase().required().default(config.group),
            category: Joi.string().optional().valid(['WARN', 'INFO']).default('INFO'),
          }
      },
      plugins: {
          'hapi-io': 'clear-Event'
      }
  },
  handler: function (request, reply) {
    var service = new Service(config);
    var params = {
        group_id: request.params.id,
        date: moment().utc().format('YYYY-MM-DD'),
        category :request.params.category
    }
    service.delete(params, function(err, result) {
      console.log(err,result);
      if(err) {
        reply({ statusCode: 500, message:err });
      }
      else {
        reply({
          statusCode: 200,
          success: result.success,
          message: result.message,
          events: result.data
        });
      }
    });
  }}
];