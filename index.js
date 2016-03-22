'use strict';

// ================ Base Setup ========================

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');
const Routes = require('./routes');
const HapiSocket =require('hapi-io');
const io = require('socket.io')();
// Create Server Object
const server = new Hapi.Server();

server.connection({
  port: process.env.API_PORT || 7002
});

const swaggerOptions = {
  info: {
    'title': 'SmartPark Event Manager',
    'version': Pack.version,
  },
  documentationPath: '/api/'
};

server.register([
  Inert,
  Vision,
  {
    register: HapiSwagger,
    options: swaggerOptions
  },{
    register: HapiSocket,
    options: {
     message: 'hello'
    } 
  }], (err) => {
    if (err) {
      server.log(['error'], 'hapi-swagger load error: ' + err)
    } else {
      server.log(['start'], 'hapi-swagger interface loaded')
    }
  });

server.route(Routes.routes);

// =============== Start our Server =======================
// Lets start the server
server.start(() => {
  console.log('Server running at:', server.info.uri);
});
