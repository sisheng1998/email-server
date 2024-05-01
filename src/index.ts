import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './middleware'
import { Bindings } from './types'
import emailSchema from './zod'
import { sendEmail } from './email'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.get('/', (c) => c.redirect('https://sisheng.my', 302))

app.post('/send', auth(), async (c) => {
  const email = await c.req.json()
  const result = emailSchema.safeParse(email)

  if (!result.success)
    return c.json(
      {
        success: false,
        message: 'Invalid input',
        issues: result.error.flatten(),
      },
      400
    )

  try {
    const response = await sendEmail(email, c.env)
    return c.json(response, response.status)
  } catch (error) {
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : error?.toString(),
      },
      400
    )
  }
})

app.notFound((c) => c.json({ success: false, message: 'Not found' }, 404))

app.onError((error, c) =>
  c.json({ success: false, message: error.message }, 500)
)

export default app
