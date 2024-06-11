import { MiddlewareHandler } from "hono/types";
import { getPath } from "hono/utils/url";
import { log, time } from "@/utils/logger";

export const logger = (): MiddlewareHandler => async (c, next) => {
  const { method } = c.req;

  const path = getPath(c.req.raw);

  log.incoming(method, path);

  const start = Date.now();

  await next();

  log.outgoing(method, path, c.res.status.toString(), time(start));
};
