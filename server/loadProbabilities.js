const csvFilePath='../data/status_3_months.csv';
const math = require('mathjs');
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

async function parseStationStatus(clientObj, data_array) {
    /*
        Parses the data array from json into a format as below:
        {'Monday' : {'8:01':  {'bikeAvg':1234,
                               'bikeMu': 234, //standart deviation
                               'dockAvg': 125,
                               'dockMu': 678,
                              },
                    .... For every minute
                    },
        'Tuesday' : {'8:01' : ...
                    } 
        }
        Processes bike availability only for busy time slots (8 AM - 6 PM)
    */
   var r3 = await clientObj.db(dbName).collection('dump').insertMany(data_array);
   /* data_array is of form:
        {
        "_id" : ObjectId("5aeb7d20a935a30561b9a28f"),
        "station_id" : "2",
        "bikes_available" : "3",
        "docks_available" : "24",
        "time" : "2013/08/29 13:30:01"
        }
   */
   var stationsMap = {0:'Monday',
                      1:'Tuesday',
                      2:'Wednesday',
                      3:'Thursday',
                      4:'Friday',
                      5:'Saturday',
                      6:'Sunday'
   }
   stationStatusMap = {};
   data_array.forEach(stationStatus=> {
        var tempJson = {};
        tempJson.bikeAvg = null;
        tempJson.bikeMu = null;
        tempJson.dockAvg = null;
        tempJson.dockMu = null;
        tempJson.bikes = [stationStatus.bikes_available];
        tempJson.docks = [stationStatus.docks_available];
        var stationDay = new Date(stationStatus.time.slice(0,11)).getDay(); // Extract date
        var stationTime = stationStatus.time.slice(11,16); //Extract time part of the string
        var stationId = stationStatus.station_id;
        if (!isNaN(parseInt(stationId))) {
            if (stationStatusMap.hasOwnProperty(stationId)) {
                if (stationStatusMap[stationId].hasOwnProperty(stationDay)) {
                    if (stationStatusMap[stationId][stationDay].hasOwnProperty(stationTime)) {
                        stationStatusMap[stationId][stationDay][stationTime].bikes.push(stationStatus.bikes_available);
                        stationStatusMap[stationId][stationDay][stationTime].docks.push(stationStatus.docks_available);
                    }
                    else { //No time
                        stationStatusMap[stationId][stationDay][stationTime] = tempJson;
                    }
                }
                else { //No Day
                    stationStatusMap[stationId][stationDay] = {};
                    stationStatusMap[stationId][stationDay][stationTime] = tempJson;
                }
            }
            else { //No station
                stationStatusMap[stationId] = {};
                stationStatusMap[stationId][stationDay] = {};
                stationStatusMap[stationId][stationDay][stationTime] = tempJson;
            }
        }
   });
   //populate mean and standard deviations
   console.log(stationStatusMap);
   Object.keys(stationStatusMap).forEach(stationStationId => {
       Object.keys(stationStatusMap[stationStationId]).forEach(stationStatusDay => { //For each day
           Object.keys(stationStatusMap[stationStationId][stationStatusDay]).forEach(stationStatusTime => {
                var currentElement = stationStatusMap[stationStationId][stationStatusDay][stationStatusTime];
                console.log("ID "+ stationStationId);
                console.log("Day "+stationStatusDay);
                console.log("Time "+stationStatusTime);
                console.log(currentElement.bikes);
                try {
                    currentElement.bikeAvg = math.mean(currentElement.bikes);
                    currentElement.bikeMu = math.std(currentElement.bikes);
                    currentElement.dockAvg = math.mean(currentElement.docks);
                    currentElement.dockMu = math.std(currentElement.docks);
                }
                catch(ex) {
                    console.log(err.stack);
                    console.log('couldnt resolve');
                }
            })
        })
   })
   console.log(stationStatusMap);
   var r4 = await clientObj.db(dbName).collection('dumpNew').insert(stationStatusMap);
}

(async function() {
  try {
    const clientObj = await connectMongo();
    console.log("Reading from File");
    let data_array = await readFromFile(clientObj);
    //console.log(data_array);
    //var r3 = await clientObj.db(dbName).collection('trips').insertMany(data_array);
    //console.log(r3.insertedCount);
    await parseStationStatus(clientObj,data_array);
    await disconnectMongo(clientObj);

  } catch(err) {
    console.log(err.stack);
  }
})();
