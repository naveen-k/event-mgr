'use strict';
var uuid = require('node-uuid');
var moment = require('moment');
var Joi = require('joi');

var Model = function(args) {
  var self = this;

  var _eventSchema = {
      id: Joi.string().guid(),
      group_id: Joi.string().required(),
      description: Joi.string().required().allow(''),
      category: Joi.string().required().valid(['WARN', 'INFO']),
      date: Joi.date().format('YYYY-MM-DD').raw(),
      options: Joi.any().optional(),
      created : moment().utc().format('YYYY-MM-DD')
  };

var _addEventSchema = {
      id: Joi.string().guid(),
      group_id: Joi.string().required(),
      description: Joi.string().required(),
      category: Joi.string().required().valid(['WARN', 'INFO']),
      date: Joi.date().format('YYYY-MM-DD').raw(),
      options: Joi.any().optional(),
      created : moment().utc().format('YYYY-MM-DD')
  };

  self.Event = class Event {
    constructor(args) {
      if(!args) { args = {} };
      this.id = args.id || uuid.v4();
      this.group_id = args.group_id || 'WALTHAM-01';
      this.category = args.category || 'INFO';
      this.description = args.description || 'UNKNOWN EVENT';
      this.options = args.options || {};
      this.date = args.date || moment().utc().format('YYYY-MM-DD');
      this.created = args.created;
    }
    isValid() {
      return Joi.validate(this, Joi.object().keys(_eventSchema)).error;
    }
  }
  self.AddEvent = class Event {
    constructor(args) {
      if(!args) { args = {} };
      this.group_id = args.group_id;
      this.description = args.description;
      this.category = args.category;
      this.date = args.date;
      this.options = args.options;
    }
    isValid() {
      return Joi.validate(this, Joi.object().keys(_eventSchema)).error;
    }
  }

  self.PageResult = class {
    constructor() {
      this.pages = 0;
      this.currentPage = 0;
      this.count = 0;
      this.events = [];
    }
  }

  self.Response = class {
    constructor(args) {
      if(!args) { args = {} };
      this.success = false || args.success;
      this.message = null || args.message;
      this.data = null;
    }
  }

  self.Schema = {
    Event: _eventSchema,
    AddEvent: _addEventSchema
  }

  return self;
}

module.exports = new Model();