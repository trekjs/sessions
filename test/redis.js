import test from 'ava'
import Engine from 'trek-engine'
import RedisProvider from 'sessions-provider-redis'
import request from 'request-promise'
import listen from './helpers/listen'
import sessions from '..'

test('should clear all sessions', async t => {
  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(await sessions({
    cookie: {
      signed: false,
      maxAge: 60 * 1000 // 1 minutes
    },
    provider: new RedisProvider()
  }))

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

  const url = await listen(app)
  const res = await request({ url, json: true })
  t.is(res.count, 1)

  /*
  const jar = request.jar()
  res = await request({ url, jar, json: true })
  t.is(res.count, 1)

  res = await request({ url, jar, json: true })
  t.is(res.count, 2)

  res = await request({ url, jar, json: true })
  t.is(res.count, 3)
  */
})
