import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.redirect('https://sisheng.my', 302))

app.post('/send', (c) => c.json({ success: true, message: 'Email sent!' }))

app.notFound((c) => c.json({ success: false, message: 'Not found' }, 404))

app.onError((err, c) => c.json({ success: false, message: err.message }, 500))

export default app
