const csvFilePath='../data/2017-fordgobike-tripdata.csv';
const csv=require('csvtojson');
const fs = require('file-system');
var data_array = [];
csv()
.fromFile(csvFilePath)
.on('json',(jsonObj)=>{
    
    // combine csv header row and csv line to a json object
    data_array.push(jsonObj);
    //console.log(data_array);
})
.on('done',(error)=>{
    console.log('end');
    var data = JSON.stringify(data_array);
    fs.writeFileSync('2017_data.json', data);
});