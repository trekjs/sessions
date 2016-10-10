'use strict'

const Engine = require('trek-engine')
const sessions = require('../..')

async function start (port = 3000) {
  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(sessions({
    cookie: {
      signed: false,
      maxAge: 6 * 1000 // 1 minutes
    }
  }))

  app.use(ctx => {
    ctx.res.body = ctx.session
  })

  await app.run(port)
}

start().catch(console.error)
