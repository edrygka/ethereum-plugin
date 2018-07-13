const express = require('express')
const bodyParser = require('body-parser')
const logger = require('./logger')

const app = express()
const PORT = 3000

app.use(bodyParser.urlencoded({ extended: true }))

require('./routes')(app)

app.listen(PORT, () => {
  logger.info('We are live on ' + PORT)
})











