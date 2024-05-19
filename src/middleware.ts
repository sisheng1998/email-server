import { Context, MiddlewareHandler } from 'hono'
import { Bindings } from './types'
import emailSchema from './zod'
import { log } from './logger'

export const authMiddleware =
  (): MiddlewareHandler => async (c: Context<{ Bindings: Bindings }>, next) => {
    const token = c.req.header('Authorization')?.split('Bearer ')[1]

    if (!c.env.API_TOKEN || c.env.API_TOKEN.length === 0) {
      const message = 'Missing API_TOKEN environment variable'

      log.error(message)

      return c.json(
        {
          success: false,
          message,
        },
        500
      )
    }

    if (!token || token !== c.env.API_TOKEN) {
      const message = `${!token ? 'Missing' : 'Invalid'} authorization token`

      log.error(message)

      return c.json(
        {
          success: false,
          message,
        },
        401
      )
    }

    await next()
  }

export const inputMiddleware =
  (): MiddlewareHandler => async (c: Context<{ Bindings: Bindings }>, next) => {
    const email = await c.req.json()
    const result = emailSchema.safeParse(email)

    if (!result.success) {
      const message = 'Invalid input'

      log.error(message, JSON.stringify(result.error.flatten()))

      return c.json(
        {
          success: false,
          message,
          issues: result.error.flatten(),
        },
        400
      )
    }

    await next()
  }
