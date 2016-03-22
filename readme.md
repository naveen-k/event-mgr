# Setup

### Cassandra

Install Cassandra

```
$ brew install cassandra
$ cassandra
```

### Install

```
$ npm install
```

### Test

```
$ npm test
```

### Docker Build

```
$ npm run build
```

### Docker Run

```
$ npm run start-docker
```

### LocalHost Run

```
$ npm start
```

# Environment Variables that can be set

- LOG_LEVEL
	- info
	- debug
	- trace

- DB_HOST: cassandra database hostname/ip

- DB_PORT: cassanrda database port

- DB_KEYSPACE: cassandra database keyspace name to use

# Launch swagger UI (REST interface)
- http://hostip:7002/api/

 
###### SocketIO Client

```js
var socket = io("http://hostip:7002/");
    
var event='get-event';
var query ={ id: 'CIMCON-DCU-01'};     
// get the event by GROUP ID           
socket.emit(event, query, function(res){
   console.log("Response :",res);        
});
// watch for new event          
socket.on('add-Event', function(data){
    console.log("New Event added", data);
}); 
     
```
##### Socket event hook
* `get-event` - Get all Events for a Group
* `add-Event` - Add an Event for a Group
* `get-all-event` - Get All Events by category
* `get-all-event-by-dec` - Get All Events by description for Group
* `get-event-bydate` - Get all Events for a Group for given date
* `clear-Event` - Clear events for a Group based on category

