const express = require('express')
const app = express()
const dbName = "bikely"; 
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';  
var clientObj = null;
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

(async function(){
    try {
        clientObj = await connectMongo();
        console.log('Connected!');
    }
    catch (err) {
        console.log(err.error.stack);
    }
});

var readDocs = null;
var db = null;
app.get('/', (req, res) => {
            //const docs = await clientObj.db(dbName).collection('trips').find({}).toArray();
            //res.sendFile(__dirname + '/../client/index.html');
            res.set('Access-Control-Allow-Origin','*');
            db.collection('stations').find().toArray(function(err,results){
                console.log(Object.values(Object.values(results)));
                res.send(Object.values(results));
                //res.sendFile(__dirname + '/index.html');
            })
        });
app.get('/stations', (req,res) => {
    console.log(__dirname);
    res.sendFile(__dirname+"/public/stations2.html");
});
app.get('/getfrequency', (req,res) => {
    res.set('Access-Control-Allow-Origin','*');
    db.collection('stationsFreqArray').find().toArray(function(err,stationFreqRes){
        res.send(stationFreqRes);
    });
})
app.get('/getprobabilities', (req,res)=> {
    res.set('Access-Control-Allow-Origin','*');
    db.collection('dumpNew').find({}).toArray(function(err, probabilitiesResOld) {
        console.log(probabilitiesResOld);
        probabilitiesRes = probabilitiesResOld[0]['data'];
        console.log(Object.keys(probabilitiesRes));
        var dow = req.param('dow');
        var timeOfDay = req.param('time');
        var dayReverseMap = {'Monday':0,
                              'Tuesday':1,
                              'Wednesday':2,
                              'Thursday':3,
                              'Friday':4,
                              'Saturday':5,
                              'Sunday':6
                             }
        if (!dayReverseMap.hasOwnProperty(dow)) {
            res.send('Invalid Date');
        }
        else {
            dow = dayReverseMap[dow];
        }
        // Using mean - 1 sigma as pessimistic calculations. This is to give 93% confidence level
        // Ranges for colors: 0-2: Red, 2-5: Yellow; 5+ Green
        stationProbabilities = [];
        //let stationsMap = await db(dbName).collection('stationsMap').find().toArray(
        db.collection('stationsMap').find().toArray(function(err,stationsMapOld){
            var stationsMap = stationsMapOld[0];
            console.log(Object.keys(probabilitiesRes).length);
            Object.keys(probabilitiesRes).forEach(stationId => {
                if (stationId != '_id') {
                    console.log("Station ID "+stationId);
                    if (probabilitiesRes[stationId].hasOwnProperty(dow)) {
                        var currentObject = probabilitiesRes[stationId][dow][timeOfDay]
                        var availability = currentObject.bikeAvg - currentObject.bikeMu;
                        var tempStationProbability = {};
                        var color = null;
                        if (availability <= 2) {
                            color = 'red';
                        }
                        else if (availability > 2 && availability <= 5) {
                            color = 'orange';
                        }
                        else {
                            color = 'green';
                        }
                        if (stationsMap.hasOwnProperty(stationId)) {
                            tempStationProbability.name = stationsMap[stationId].name;
                            tempStationProbability.latitude = stationsMap[stationId].latitude;
                            tempStationProbability.longitude = stationsMapp[stationId].longitude;
                            tempStationProbability.bikeAvailability = availability;
                            tempStationProbability.color = color;
                            stationProbabilities.push(tempStationProbability)
                        }
                        else {
                            console.log("Cannot find!");
                        }
                    }
                }
            })
        });
        //res.send(probabilitiesRes);
        res.send(stationProbabilities);
    });
});
app.get('/frequency', (req,res) => {
    console.log(__dirname);
    res.sendFile(__dirname+"/public/mapboxTrial2.html");
})
app.get('/test', (req, res) => res.send('Hello World2!'))
MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err)
    db = client.db(dbName); // whatever your database name is
    app.listen(3000, () => {
      console.log('listening on 3000');
    })
  })
