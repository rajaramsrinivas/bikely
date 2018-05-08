const express = require('express')
const app = express()

const { Pool } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bikely',
    password: '',
});
app.get('/', (req, res) => res.send('Hello World!'));

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
    res.sendFile(__dirname+"/public/stations2.html");
});
app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
})