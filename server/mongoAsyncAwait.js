const csvFilePath='../data/201801_fordgobike_tripdata.csv';
const csv=require('csvtojson');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'bikely';

async function connectMongo() {
    try {
        const client = await MongoClient.connect(url);
        console.log("Connected successfully");
        return client;
    } 
    catch (err) {
        console.log(err.error.stack);
    }
}

async function disconnectMongo(clientObj) {
    /*
        Disconnects client for the passed Object
    */
    try {
        await clientObj.close();
    }
    catch(err) {
        console.log(err.stack);
    }
}

var stations = [];
var data_array = [];
var stationsAdded = [];
var tempStation = {};

async function readFromFile(clientObj) {
    return new Promise( function (resolve, reject) {
        csv().fromFile(csvFilePath).on('json',(jsonObj) => {
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
            })
            .on('done',(jsonObj) => {
                /*insertedCount = writeDocToDb(data_array,'trips').then( v => {
                console.log("Inserted "+insertedCount+" records");
                });
                insertedCount = writeDocToDb(stations,'stations').then ( v => {
                    console.log("Inserted "+insertedCount+" stations");
                });*/
                console.log('end');
                resolve(data_array);
                var data = JSON.stringify(data_array);
            });
    })
}

(async function() {
  try {
    const clientObj = await connectMongo();
 
    // Insert a single document
    let r = await clientObj.db(dbName).collection('inserts').insertOne({a:1});
    assert.equal(1, r.insertedCount);

    // Insert multiple documents
    var r2 = await clientObj.db(dbName).collection('inserts').insertMany([{a:2}, {a:3}]);
    assert.equal(2, r2.insertedCount);

    let data_array = await readFromFile(clientObj);
    console.log(data_array);

    var r3 = await clientObj.db(dbName).collection('trips').insertMany(data_array);
    console.log(r3.insertedCount);

    await disconnectMongo(clientObj);

  } catch(err) {
    console.log(err.stack);
  }
})();
