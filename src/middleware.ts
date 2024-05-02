import { Context, MiddlewareHandler } from 'hono'
import { Bindings } from './types'
import emailSchema from './zod'

export const authMiddleware =
  (): MiddlewareHandler => async (c: Context<{ Bindings: Bindings }>, next) => {
    const token = c.req.header('Authorization')

    if (!c.env.AUTH_TOKEN || c.env.AUTH_TOKEN.length === 0)
      return c.json(
        {
          success: false,
          message: 'Missing AUTH_TOKEN environment variable',
        },
        500
      )

    if (!token || token !== c.env.AUTH_TOKEN)
      return c.json(
        {
          success: false,
          message: `${!token ? 'Missing' : 'Invalid'} authorization token`,
        },
        401
      )

    await next()
  }

export const inputMiddleware =
  (): MiddlewareHandler => async (c: Context<{ Bindings: Bindings }>, next) => {
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

    await next()
  }
