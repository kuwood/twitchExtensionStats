require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser') 
const request = require('request')
const rp = require('request-promise-native')
const cronJob = require('cron').CronJob
const {sequelize} = require('../db/sequelize')

const {Extension, Channel} = require('../models')

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
    const extensions = await getAllExtensions()
    const released = extensions.filter(ext => ext.state === `Released`)
    const replaceIdWithTwitchExtId = released.map(ext => {
      ext.twitch_ext_id = ext.id
      delete ext.id
      return ext
    })
    let createCount = 0
    for (let i = 0; i < replaceIdWithTwitchExtId.length; i++) {
      const el = replaceIdWithTwitchExtId[i]
      Extension.create(el,{logging: sqlLog, benchmark: true})
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

function sqlLog(_,benchmark) {
  console.log(`${benchmark} MS`)
}

function getLiveChannels(twitch_ext_id, ext_id, qs) {
  console.log('calling', twitch_ext_id, qs ? `with cursor ${qs}` : '')
  let options = {
    method: 'GET',
    url: `https://api.twitch.tv/extensions/${twitch_ext_id}/live_activated_channels${qs}`,
    headers: {
      'content-type': 'application/json',
      'client-id': twitch_ext_id
    }
  }
  return rp(options).then(data => {
    // save data
    let parsed = JSON.parse(data)
    let channels = parsed.channels
    const replaceIdWithTwitchChannelId = channels.map(channel => {
      channel.twitch_id = channel.id
      delete channel.id
      return channel
    })
    const addExtensionRelation = replaceIdWithTwitchChannelId.map(channel => {
      channel.extension_id = ext_id
      return channel
    })
    
    Channel.bulkCreate(addExtensionRelation, {logging: false, benchmark: false})
    .catch(err => console.log('bulk create err', err, 'bulk create err'))
    if (parsed.cursor) {
      // settimeout to make sure we do not surpass rate limit
      setTimeout(() => {
        getLiveChannels(twitch_ext_id, ext_id, `?cursor=${parsed.cursor}`)
      }, 1000);
    }
  }).catch(err => console.log('getLiveChannels error', err.message, err.options.url, 'getLiveChannels err'))
}

const hourlyExtensionUpdate = new cronJob('0 * * * *', () => {
  createReleasedExtensions()
}, null, true, 'America/Los_Angeles')

const biHourlyChannelsUpdate = new cronJob('0,30 * * * *', () => {
  // get all from extensions table
  sequelize.query(
    `SELECT * FROM extensions
    WHERE created_at BETWEEN now() - interval '1' HOUR AND now()`,
    {type: sequelize.QueryTypes.SELECT}
  )
  .then(extensions => {
    for (let i = 0; i < extensions.length; i++) {
      const ext = extensions[i]
      setTimeout(() => {
        getLiveChannels(ext.twitch_ext_id, ext.id, '')
      }, 1000 * (i + 1));
    }
  }).catch(err => console.log('fnd all', err, 'fnd all'))
  // for each active channel get chatters list
  
}, null, true, 'America/Los_Angeles')

const port = process.env.PORT || 3000
app.listen(port, console.log(`listening on port ${port}`))