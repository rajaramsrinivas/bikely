const express = require('express')
const app = express()

const { Pool } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bikely',
    password: '',
});

app.get('/probability', async(req,res) => {
    var dow = req.param('dow');
    //var dow = 'Monday';
    var dayReverseMap = {'Monday':1,
                        'Tuesday':2,
                        'Wednesday':3,
                        'Thursday':4,
                        'Friday':5,
                        'Saturday':6,
                        'Sunday':0
                        }
    var docks = req.param('docks');
    var hour = req.param('hour');
    //var hour = 10;
    var minute = req.param('minute');
    //var minute = 20;
    var queryString = `SELECT station_id, dow, hour, minute, avg_bikes, avg_docks,
                            std_bikes, std_docks, station_name, latitude, longitude
                    FROM station_probabilities JOIN station_master USING (station_id)
                    WHERE dow = '`+dayReverseMap[dow]+`' AND hour = `+ hour +' AND minute = '+minute;
    console.log(queryString);
    const { rows } = await pool.query(queryString);
    /*rows.forEach(element=> {
        console.log(element);
        })*/
    //await pool.end();
    res.send(rows);
});
app.get('/stations', (req,res) => {
    console.log(__dirname);
    var dow = req.param('dow');
    var minute = req.param('minute');
    var hour = req.param('hour');
    res.sendFile(__dirname+"/public/stations2.html");//?dow="+dow+"&minute="+minute+"&hour="+hour);
});
app.get('/docks', (req,res) => {
    res.sendFile(__dirname+"/public/docks2.html");//?dow="+dow+"&minute="+minute+"&hour="+hour);
})
app.get('/', (req, res) => {
    res.sendFile(__dirname+"/public/UI.html");
});
app.get('/plan', (req,res) => {
    res.sendFile(__dirname+"/public/plan.html");
});
app.get('/planapi', async(req,res) => {
    var source = req.param('source');
    var destination = req.param('destination');
    var dow = req.param('dow');
    //var dow = 'Monday';
    var dayReverseMap = {'Monday':1,
                        'Tuesday':2,
                        'Wednesday':3,
                        'Thursday':4,
                        'Friday':5,
                        'Saturday':6,
                        'Sunday':0
                        }
    var hour = req.param('hour');
    //var hour = 10;
    var minute = req.param('minute');
    var dow = req.param('dow');
    //var dow = 'Monday';
    var queryString = `SELECT station_id, station_name FROM station_master
                       WHERE station_name IN ('`+source+`','`+destination+`');`;
    console.log(queryString);
    const { rows } = await pool.query(queryString);
    /*rows.forEach(element=> {
        console.log(element);
        })*/
    //await pool.end();
    stationsMap = {} //id:name
    stationsReverseMap = {} //name:id
    var stationIds = []
    rows.forEach(element => {
        stationsMap[element.station_id] = element.station_name;
        stationsReverseMap[element.station_name] = element.station_id;
        stationIds.push(element.station_id);
    });
    console.log(stationsReverseMap);
    var queryString = `SELECT average_duration FROM
                       avg_durations WHERE start_station_id = `+stationsReverseMap[source]+
                       ` AND end_station_id = `+stationsReverseMap[destination];
    console.log(queryString);
    var someResult = await pool.query(queryString);
    var duration = Math.round((someResult.rows[0].average_duration)/60);
    var responseDict = {}
    responseDict.duration = duration;
    responseDict.fromStation = source;
    responseDict.toStation = destination;
    var queryString = `SELECT station_id, dow, hour, minute, avg_bikes, avg_docks,
                            std_bikes, std_docks, station_name, latitude, longitude
                    FROM station_probabilities JOIN station_master USING (station_id)
                    WHERE dow = '`+dayReverseMap[dow]+`' AND hour = `+ hour +' AND minute = '+minute
                    +" AND station_id in ("+stationIds[0]+","+stationIds[1]+")";
    console.log(queryString);
    var resultSet = await pool.query(queryString);
    resultSet = resultSet.rows;
    resultSet.forEach(element => {
        if (element.station_id == stationsReverseMap[destination]) {
            responseDict.docks = element.avg_docks - element.std_docks;
        }
        else {
            responseDict.bikes = element.avg_bikes - element.std_bikes;
        }
    })    
    res.send(responseDict);
})
app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
})