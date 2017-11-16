require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser') 
const request = require('request')
const cronJob = require('cron').CronJob

const app = express()
 
app.use(helmet())
app.use(morgan('tiny'))
app.use(bodyParser.json())

// 25 might be max limit
const EXTENSION_LIMIT = 25
let allExt = []
let initPostData = {
  "limit": EXTENSION_LIMIT,
  "offset": 0,
  "sorts": [
    {
      "field":"popularity",
      "direction":"desc"
    }
  ]
}

function getExtensions(postData) {
  let options = {
  method: 'POST',
  url: 'https://api.twitch.tv/v5/extensions/search',
  headers: {
    'content-type': 'application/json',
    authorization: `OAuth ${process.env.OAUTH}`,
    accept: 'application/vnd.twitchtv.v5+json' },
    body: postData,
    json: true 
  }

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    if (body.extensions) {
      console.log('pushing', body.extensions.length)
      allExt.push(...body.extensions)
      postData.offset += EXTENSION_LIMIT
      getExtensions(postData)
    } else {
      console.log(allExt.length)
    }
  })
}

// TODO: to then filter the extensions by ones that have the key/val {"state": "Released"}

const port = process.env.PORT || 3000
app.listen(port, console.log(`listening on port ${port}`))