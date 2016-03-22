/* jshint -W024, -W101, -W079, -W098 */
/* jshint expr:true */
'use strict';

var should = require('chai').should();
var uuid = require('node-uuid');
var Model = require('../lib/models');

describe('Model.Event', () => {
  describe('Default Values', () => {
    var args = { group_id: uuid.v4() }; // group ID IS REQUIRED
    var model = new Model.Event(args);

    it('Guid id is auto set', () =>  should.exist(model.id) );
    it('Default value for group_id is set', () => should.exist(model.group_id));
    it('Description defaults to UNKNOWN EVENT', () => model.description.should.be.equal('UNKNOWN EVENT'));
    it('Category defaults to INFO', () => model.category.should.equal('INFO'));
    it('Options is an empty object', () => model.options.should.be.empty);
    it('Date is auto set to Date.UTC()', () => should.exist(model.date));
    it('Validation should pass', () => should.not.exist(model.isValid()));

  });
  describe('Arguments', () => {

    var args = {
      group_id: 'group_id',
      description: 'Test Description',
      category: 'WARN',
      date: "2016-01-29",
      options: [
        { name: 'image_url', value: 'http://pictures.com/image1.jpg' },
        { name: 'spot', value: 'SPOT008' }
      ]
    };
    var model = new Model.Event(args);

    it('should have a group_id', () => model.group_id.should.equal(args.group_id));
    it('should have a description', () => model.description.should.equal(args.description));
    it('should have a category', () => model.category.should.equal(args.category));
    it('should have a options', () => model.options.should.equal(args.options));
    it('should have a date', () => model.date.should.equal(args.date));
    it('should be valid', () => should.not.exist(model.isValid()));

  });
});