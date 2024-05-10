import { StatusCode } from 'hono/utils/http-status'
import { Bindings } from './types'
import { Email } from './zod'
import { getMCEmail } from './utils'

export const sendEmail = async (
  email: Email,
  env: Bindings,
  attempts: number = 3,
  delay: number = 1000
) => {
  const mcEmail = getMCEmail(email, env)

  const url = `https://api.mailchannels.net/tx/v1/send${
    email.dryRun ? '?dry-run=true' : ''
  }`

  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(mcEmail),
  }

  let attempt = 0

  while (attempt < attempts) {
    const response = await fetch(url, options)

    if (response.ok) {
      const body = await response.json()

      return {
        success: true,
        status: response.status as StatusCode,
        message: response.statusText,
        body,
      }
    }

    attempt++

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    } else {
      const body = await response.text()

      return {
        success: false,
        status: response.status as StatusCode,
        message: response.statusText,
        body,
      }
    }
  }
}
