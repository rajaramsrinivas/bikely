const express = require('express')
const app = express()

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

async function writeDocToDb(docToWrite) {
  let client;

  try {
    client = await MongoClient.connect(url);
    console.log("Connected correctly to server");

    const db = client.db(dbName);

    // Insert multiple documents
    r = await db.collection('inserts').insertMany(docToWrite);
    client.close()
    return r.insertedCount;
  } catch (err) {
    console.log(err.stack);
  }

  // Close connection
  client.close();
};


app.get('/', (req, res) => res.send('Hello World!'+req.query.q))
app.get('/test', (req, res) => res.send('Hello World2!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
