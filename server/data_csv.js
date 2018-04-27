const csvFilePath='../data/201801_fordgobike_tripdata.csv';
const csv=require('csvtojson');
const fs = require('file-system');

const dbName = "bikely";
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';

var dbHandle = null;

async function writeDocToDb(docToWrite, collectionName) {
  let client;

  try {
    client = await MongoClient.connect(url);
    console.log("Connected correctly to server");

    const db = client.db(dbName);
    dbHandle = db; //for scope

    // Insert multiple documents
    console.log(docToWrite);
    console.log(collectionName);
    r = await db.collection(collectionName).insertMany(docToWrite);
    client.close()
    console.log(r.result.n);
  } catch (err) {
    console.log(err.stack);
  }

  // Close connection
  client.close();
};

async function closeDb(dbHandle) {
    dbHandle.close();
};

async function ReadStationByID(stationId) {

};

var stations = [];
var data_array = [];
var stationsAdded = [];
var tempStation = {};
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
    console.log ("Searching station_id "+tempStation.station_id);
    console.log(present_flag);
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
