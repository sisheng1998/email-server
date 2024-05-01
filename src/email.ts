import { StatusCode } from 'hono/utils/http-status'
import { Bindings } from './types'
import { Email } from './zod'
import { getMCEmail } from './utils'

export const sendEmail = async (email: Email, env: Bindings) => {
  const mcEmail = getMCEmail(email, env)

  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(mcEmail),
  })

  const body = await (response.ok ? response.json() : response.text())

  return {
    success: response.ok,
    status: response.status as StatusCode,
    message: response.statusText,
    body,
  }
}
