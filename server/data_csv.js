const csvFilePath='../data/201801_fordgobike_tripdata.csv';
const csv=require('csvtojson');
const utils = require('./util.js');
const fs = require('file-system');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const collections = ['trips','stations'] 
// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'myproject';
 
// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 
  const db = client.db(dbName);
  flushAllData(db, function() {
      insertDocuments(db, function() {
        client.close();
    });
  });
});


const insertDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}


var stations = [];
var data_array = [];
var stationsAdded = [];
var tempStation = {};
function flushAllData(db, callback) {
    collections.forEach((element) => {
       db.collection(element).remove({}, function(err,result) {
           console.log('Flushed '+element);
       });
    });
}

csv()
.fromFile(csvFilePath)
.on('json',(jsonObj)=>{
    // combine csv header row and csv line to a json object
    tempStation = {};
    tempStation.station_id = jsonObj.start_station_id;
    tempStation.latitude = jsonObj.start_station_latitude;
    tempStation.longitude = jsonObj.start_station_longitude;
    tempStation.name = jsonObj.start_station_name;
    present_flag = stations.filter(object => object.station_id == tempStation.station_id);
    console.log(present_flag)
    if (present_flag.length ==0 ) {
        stations.push(tempStation)
    }
    data_array.push(jsonObj);
    //console.log(data_array);
})
.on('done',(error)=>{
    insertedCount = writeDocToDb(data_array,'trips').then( v => {
    console.log("Inserted "+insertedCount+" records");
    });
    insertedCount = writeDocToDb(stations,'stations').then ( v => {
        console.log("Inserted "+insertedCount+" stations");
    });
    console.log('end');
    var data = JSON.stringify(data_array);
    //fs.writeFileSync('2017_data.json', data);
});
