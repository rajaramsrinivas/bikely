const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/test', (req, res) => res.send('Hello World2!'))

app.listen(80, () => console.log('Example app listening on port 3000!'))
