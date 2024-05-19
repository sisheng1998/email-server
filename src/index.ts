import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware, inputMiddleware } from './middleware'
import { Bindings } from './types'
import { Email } from './zod'
import { sendEmail } from './email'
import { log, logger } from './logger'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.use(logger())

app.get('/', (c) => c.redirect('https://sisheng.my', 302))

app.post('/send', authMiddleware(), inputMiddleware(), async (c) => {
  const email: Email = await c.req.json()

  try {
    const response = await sendEmail(email, c.env)
    return c.json(response, response.status)
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
  const message = error.message

  log.error(message)

  return c.json({ success: false, message }, 500)
})

export default app
