'use strict'

const Engine = require('trek-engine')
const RedisProvider = require('sessions-provider-redis')
const sessions = require('../..')

async function start(port = 3000) {
  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(
    await sessions({
      cookie: {
        signed: false,
        maxAge: 60 * 1000 // 1 minutes
      },
      provider: new RedisProvider()
    })
  )

  app.use(async ctx => {
    if (ctx.session.count) {
      ctx.session.count++
    } else {
      ctx.session.count = 1
    }
    if (ctx.req.path === '/clear') {
      ctx.session = null
      await ctx.sessions.store.clear()
    }
    ctx.res.body = ctx.session
  })

  await app.run(port)
}

start().catch(console.error)
