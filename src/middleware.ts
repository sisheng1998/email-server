import { Context, MiddlewareHandler } from 'hono'
import { Bindings } from './types'

export const auth =
  (): MiddlewareHandler => async (c: Context<{ Bindings: Bindings }>, next) => {
    const token = c.req.header('Authorization')

    if (!c.env.AUTH_TOKEN || c.env.AUTH_TOKEN.length === 0)
      return c.json(
        {
          success: false,
          message: 'Missing AUTH_TOKEN environment variable.',
        },
        500
      )

    if (!token)
      return c.json(
        { success: false, message: 'Missing authorization token.' },
        401
      )

    if (token !== c.env.AUTH_TOKEN)
      return c.json(
        { success: false, message: 'Invalid authorization token.' },
        401
      )

    await next()
  }
