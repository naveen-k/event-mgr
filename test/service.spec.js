/* jshint -W024, -W101, -W079, -W098 -W031 */
/* jshint expr:true */
'use strict';

const should = require('chai').should();
const uuid = require('node-uuid');
const Service = require('../lib/service');
const Client = require('../lib/dbClient');
var config = require('./config.json');
var Event = require('../lib/models').Event;

describe('Service.Event', () => {

  var db = new Client();
  var Table, service = null;

  before(done => {
    service = new Service(config);
    db.connect(config.db, function(err, db) {
      if(err) {console.log(err)};
      db.instance.Event.execute_query('truncate test.Event;', null, function(err, result) {
        Table = db.instance.Event;
        done();
      })
    });
  });


	describe('List Features', () => {
		var item = null;

    it('Retrieves a JSON Object with Events as an Array', function(done){
      service.list({}, function(err, result) {
        (err === null).should.be.true;
        result.data.events.should.be.instanceof(Array);
        result.data.events.should.have.length.above(0);
        item = result.data.events[0];
        done();
      });
    });

    describe('List Property Values', () => {
      it('Defines a id', function(){
        item.should.have.property('id');
      });
      it('Defines a group_id', function(){
        item.should.have.property('group_id');
      });
      it('Defines a description', function(){
        item.should.have.property('description');
      });
      it('Defines a options', function(){
        item.should.have.property('options');
      });
      it('Defines a category', function(){
        item.should.have.property('category');
      });
      it('Defines a date', function(){
        item.should.have.property('date');
      });
    });
	});

  describe('CRUD Features', () => {

    describe('Create Item', () => {
      var item = null;
      var dto = {
        "group_id": "IRVUI-TEST",
        "description": "TEST DESCRIPTION",
        "category": "WARN"
      };

      it('Creates an Event and returns success with an event', function(done){
        service.create(dto, function(err, result) {
          result.should.not.be.equal(null);
          result.success.should.be.true;
          item = result.data;
          done();
        });
      });
      it('Defines a Property id', function(done) {
        (item.id === null).should.be.false;
        done();
      });
      it('Defines a Unique group_id', function(done) {
        item.should.have.property('group_id', dto.group_id);
        done();
      });
      it('Defines a Property description', function(done) {
        item.should.have.property('description', dto.description);
        done();
      });
      it('Defines a options', function(){
        item.should.have.property('options');
      });
      it('Defines a Property category', function(done) {
        item.should.have.property('category', dto.category);
        done();
      });
      it('Defines a Property date', function(done) {
        item.should.have.property('date');
        done();
      });

      after(function(done) {
        Table.delete({id: item.id}, function(err){
          done();
        });
      });
    });

    describe('Delete Event', function() {
      var dto = {
        "group_id": "IRVUI-TEST",
        "description": "TEST DESCRIPTION"
      };
      var event = new Event(dto);

      before(function(done) {
        var item = new Table(event);
        item.save(function(err) {
          done();
        });
      });


      it('Deletes an event by Id', function(done) {
        service.delete(event, function(err, result) {
          result.success.should.be.true;
          done();
        });
      });

      after(function(done) {
        Table.delete({id: event.id}, function(err){
          done();
        });
      });
    });
  });


  after(done => {
    db.connect(config.db, function(err, db) {
      db.instance.Event.drop_table(function(err) {
        service.close();
        done();
      });
    });
  });
});