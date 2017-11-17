require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser') 
const request = require('request')
const rp = require('request-promise-native')
const cronJob = require('cron').CronJob

const {Extension} = require('./models')

const app = express()
 
app.use(helmet())
app.use(morgan('tiny'))
app.use(bodyParser.json())

function getExtensionsBatch(postData, allExt, resolve, reject) {
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
  rp(options)
  .then(body => {
    if (body.extensions) {
      allExt.push(...body.extensions)
      postData.offset += postData.limit
      return getExtensionsBatch(postData, allExt, resolve, reject)
    } else {
      // console.log(allExt.length)
      return resolve(allExt)
    }
  })
  .catch(e => reject(e))
}

function getAllExtensions() {
  // 25 might be max limit
  const EXTENSION_LIMIT = 25
  const initPostData = {
    "limit": EXTENSION_LIMIT,
    "offset": 0,
    "sorts": [
      {
        "field":"popularity",
        "direction":"desc"
      }
    ]
  }
  const allExt = []
  return new Promise (function (resolve, reject) {
    getExtensionsBatch(initPostData, allExt, resolve, reject)
  })
}

async function createReleasedExtensions () {
  try {
    const a = await getAllExtensions()
    const released = a.filter(ext => ext.state === `Released`)
    const replaceIdWithTwitchExtId = released.map(ext => {
      ext.twitch_ext_id = ext.id
      delete ext.id
      return ext
    })
    let createCount = 0
    for (let i = 0; i < replaceIdWithTwitchExtId.length; i++) {
      const el = replaceIdWithTwitchExtId[i]
      Extension.create(el,{logging: false})
      .then(_ => {
        createCount++
        if (i === replaceIdWithTwitchExtId.length - 1) {
          console.log(`inserted ${createCount} into extensions`)
        }
      })
      .catch(err => console.log('error creating:', err))
    }
  } catch (error) {
    console.log(error)
  }
}

const dailyEventText = new cronJob('0 * * * *', () => {
  // check for games (currently only NBA)
  createReleasedExtensions()
}, null, true, 'America/Los_Angeles')

createReleasedExtensions()

// TODO: to then filter the extensions by ones that have the key/val {"state": "Released"}

const port = process.env.PORT || 3000
app.listen(port, console.log(`listening on port ${port}`))