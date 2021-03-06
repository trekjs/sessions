import test from 'ava'
import Engine from 'trek-engine'
import MongodbProvider from 'sessions-provider-mongodb'
import request from 'request-promise'
import listen from './helpers/listen'
import sessions from '..'

test('should clear all sessions', async t => {
  const app = new Engine()
  const provider = new MongodbProvider()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(
    await sessions({
      cookie: {
        signed: false,
        maxAge: 60 * 1000 // 1 minutes
      },
      provider,
      shouldBeDeleted: 1
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

      let has = await ctx.sessions.store.has(ctx.sessionId)
      t.is(has, true)

      await ctx.sessions.store.clear()

      has = await ctx.sessions.store.has(ctx.sessionId)
      t.is(has, false)
    }
    ctx.res.body = ctx.session
  })

  const url = await listen(app)
  let res = await request({ url, json: true })
  t.is(res.count, 1)

  const jar = request.jar()
  res = await request({ url, jar, json: true })
  t.is(res.count, 1)

  res = await request({ url: url + '/clear', jar, json: true })
  t.is(res, undefined)

  res = await request({ url, jar, json: true })
  t.is(res.count, 1)
})
