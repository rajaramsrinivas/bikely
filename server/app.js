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
    db.collection('dumpNew').find().toArray(function(err, probabilitiesRes) {
        res.send(probabilitiesRes);
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
