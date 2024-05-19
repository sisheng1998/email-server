import { MiddlewareHandler } from 'hono/types'
import { getPath } from 'hono/utils/url'

enum LogPrefix {
  Incoming = '-->',
  Outgoing = '<--',
  Error = '[Error]',
}

const humanize = (times: string[]) => {
  const [delimiter, separator] = [',', '.']

  const orderTimes = times.map((v) =>
    v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + delimiter)
  )

  return orderTimes.join(separator)
}

const time = (start: number) => {
  const delta = Date.now() - start

  return humanize([
    delta < 1000 ? delta + 'ms' : Math.round(delta / 1000) + 's',
  ])
}

type LogFunction = (message: string, ...messages: string[]) => void

const logMessage: LogFunction = (message, ...messages) => {
  const timestamp = new Date().toISOString()

  const logEntry = `[${timestamp}] (${formatDate(
    timestamp
  )}) ${message.trim()} ${messages.map((m) => m.trim()).join(' ')}`

  console.log(logEntry)
}

const TIME_ZONE = 'Asia/Kuala_Lumpur'

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: TIME_ZONE,
  }

  const humanFriendlyDate = date.toLocaleDateString('en-GB', dateOptions)
  const humanFriendlyTime = date.toLocaleTimeString('en-US', timeOptions)

  return `${humanFriendlyDate}, ${humanFriendlyTime}`
}

export const logger = (): MiddlewareHandler => async (c, next) => {
  const { method } = c.req

  const path = getPath(c.req.raw)

  log.incoming(method, path)

  const start = Date.now()

  await next()

  log.outgoing(method, path, c.res.status.toString(), time(start))
}

type Log = {
  info: LogFunction
  error: LogFunction
  incoming: LogFunction
  outgoing: LogFunction
}

export const log: Log = {
  info: (message, ...messages) => logMessage(message, ...messages),
  error: (message, ...messages) =>
    logMessage(LogPrefix.Error, message, ...messages),
  incoming: (message, ...messages) =>
    logMessage(LogPrefix.Incoming, message, ...messages),
  outgoing: (message, ...messages) =>
    logMessage(LogPrefix.Outgoing, message, ...messages),
}
