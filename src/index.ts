import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Bindings } from './types'
import { auth } from './middleware'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.get('/', (c) => c.redirect('https://sisheng.my', 302))

app.post('/send', auth(), (c) =>
  c.json({ success: true, message: 'Email sent!' })
)

app.notFound((c) => c.json({ success: false, message: 'Not found.' }, 404))

app.onError((err, c) => c.json({ success: false, message: err.message }, 500))

export default app
