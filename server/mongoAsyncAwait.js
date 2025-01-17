const csvFilePath='../data/201801_fordgobike_tripdata.csv';
const fsUtil = require('./fsutil.js');
const csv=require('csvtojson');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'bikely';
const collections = ['trips','stations']; //list of all collections written to 
var stationsFrequency = {};
/* Dictionary of structure: {FromStation: [{toStation1: frequency},
                                           {toStation2: frequency},
                                          ]
                            }
*/                            

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

async function flushCollections(clientObj) {
    /*Flushes collections in said object */
    for (element in collections) {
        console.log(element);
        let status = await clientObj.db(dbName).collection('stations').deleteMany({});
        console.log(status);
    }
}

async function parseTripsForStations(clientObj) {
    /* Parses through trips to get stations
       Also builds a frequency for each start to end route
    */
    console.log("Reading stations")
    const docs = await clientObj.db(dbName).collection('trips').find({}).toArray();
    console.log("Done reading stations");
    var stations = {}; //Station objects of the form {statioId: {station_details}}
    var stationids = []; //list of station ids
    var stationsArray = [];
    docs.forEach(element => {
        var present_flag = stationids.includes(element.start_station_id);
        //console.log(stationids);
        //console.log("Skipped Station ID"+element.start_station_id);
        if (stationids.length % 10 == 0) {
            console.log("Loaded "+stationids.length+ " stations");
        }
        // Load station frequency
        if (!stationsFrequency[element.start_station_id]) {
            stationsFrequency[element.start_station_id] = {};
            stationsFrequency[element.start_station_id][element.end_station_id] = 1;
        } //ToDo: Do the rest based on this structure
        else { //From station present
            console.log("Comparing");
            if (stationsFrequency[element.start_station_id].hasOwnProperty(element.end_station_id)) {
                stationsFrequency[element.start_station_id][element.end_station_id] +=1;
                console.log("Yes");
            }
            else {
                stationsFrequency[element.start_station_id][element.end_station_id] = 1;
            }
        }
        if (!present_flag) {
            stationids.push(element.start_station_id);
            var tempStation = {};
            tempStation.station_id = element.start_station_id;
            tempStation.latitude = element.start_station_latitude;
            tempStation.longitude = element.start_station_longitude;
            tempStation.name = element.start_station_name;
            stations[element.start_station_id] = tempStation;
            stationsArray.push(tempStation);
        }
    });
    //Use stations frequency and station dictionaries to build an array of following format
    //[{latitude: xxx, longitude: xxx, frequency: x},...]
    var stationsFreqTomap = []; //Array of array of form: [[lat, long, frequency], ..]
    Object.keys(stationsFrequency).forEach(fromStationId => {
        Object.keys(fromStationId).forEach(toStationId => {
            var tempArray = [];
            tempArray.push(parseFloat(stations[fromStationId].longitude));
            tempArray.push(parseFloat(stations[fromStationId].latitude));
            //tempArray.push(stations[fromStationId][toStationId]);
            stationsFreqTomap.push(tempArray);
        })
    })
    console.log(stationsFreqTomap);
    var mongoDict = {'data':stationsFreqTomap};
    let freqArrayStatus = await clientObj.db(dbName).collection('stationsFreqArray').insert(mongoDict);
    // Load the stations into db
    // ToDo: Add Try catch
    console.log("Parsed stations");
    console.log("Writing to db....");
    let status = await clientObj.db(dbName).collection('stations').insert(stationsArray);
    let status2 = await clientObj.db(dbName).collection('stationsMap').insert(stations);
    let status3 = await fsUtil.writeFile('data/stationsMap.json',JSON.stringify(stations));
    console.log("Written stations to db");
    console.log("Trips and frequency");
    let freqStatus = await clientObj.db(dbName).collection('stationsFreq').insert(stationsFrequency);
    console.log(stationsFrequency);
    return new Promise (function (resolve,reject) {
        resolve (status.insertedCount);
    });
}

async function readFromFile(clientObj) {
    return new Promise( function (resolve, reject) {
        csv().fromFile(csvFilePath).on('json',(jsonObj) => {
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
    await flushCollections(clientObj);
    console.log("Reading from File");
    let data_array = await readFromFile(clientObj);
    console.log(data_array);
    console.log("Writing trips to db");
    var r3 = await clientObj.db(dbName).collection('trips').insertMany(data_array);
    console.log(r3.insertedCount);
    console.log("Parsing for stations")
    var stationCount = await parseTripsForStations(clientObj);
    console.log("Inserted "+stationCount+" stations");

    await disconnectMongo(clientObj);

  } catch(err) {
    console.log(err.stack);
  }
})();
