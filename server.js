require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser') 
const axios = require('axios')
const cronJob = require('cron').CronJob

const app = express()
 
app.use(helmet())
app.use(morgan('tiny'))
app.use(bodyParser.json())

async function getExtensions(offset) {
  // 25 might be max limit
  // need to post recursively while incrementing offset value by 25
  // when POST results extensions array returns null, there is not more extensions
  let postData = {
    "limit": 25,
    "offset": offset,
    "sorts": [
      {
        "field":"popularity",
        "direction":"desc"
      }
    ]
  }
  try {
    const extensions = axios({
      method: 'post',
      url: 'https://api.twitch.tv/v5/extensions/search',
      headers: {
        "Accept": `application/vnd.twitchtv.v5+json`,
        "Authorization": `OAuth ${process.env.OAUTH}`,
      },
      body: JSON.stringify(postData)
    })

    const results = await extensions
    return results
  } catch (error) {
    console.log(error)
  }
}

// TODO: need to build function to recursively call getExtensions
// if the extensions array in the return data is null, there are no more extensions
// need to then filter the extensions by ones that have the key/val {"state": "Released"}

const port = process.env.PORT || 3000
app.listen(port, console.log(`listening on port ${port}`))