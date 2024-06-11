import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import 'dotenv/config'
import { authMiddleware, inputMiddleware } from './middleware'
import { Email } from './zod'
import { sendEmail } from './email'
import { log, logger } from './logger'

const app = new Hono()

app.use('*', cors())

app.use(logger())

app.get('/', (c) => c.redirect('https://sisheng.my', 302))

app.post('/send', authMiddleware(), inputMiddleware(), async (c) => {
  const email: Email = await c.req.json()

  try {
    // const response = await sendEmail(email, c.env)
    // return c.json(response, response.status)
    return c.json({ success: true, message: 'Email sent' })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : error?.toString() || 'Unknown error occurred'

    log.error(message)

    return c.json(
      {
        success: false,
        message,
      },
      400
    )
  }
})

app.notFound((c) => c.json({ success: false, message: 'Not found' }, 404))

app.onError((error, c) => {
  const message = error.message || 'Unknown error occurred'

  log.error(message)

  return c.json({ success: false, message }, 500)
})

const port = Number(process.env.PORT || 8787)

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    log.info(
      info.port ? `Server is running on port ${info.port}` : 'Server is running'
    )
  }
)
