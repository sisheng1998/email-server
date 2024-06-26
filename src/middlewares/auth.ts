import { Context, MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import { ENV } from "@/types/env";
import { HonoResponseType } from "@/types/response";
import { log } from "@/utils/logger";

export const authMiddleware =
  (): MiddlewareHandler =>
  async (c: Context, next): Promise<HonoResponseType | void> => {
    const { API_TOKEN } = env<ENV>(c);

    const token = c.req.header("Authorization")?.split("Bearer ")[1];

    if (!API_TOKEN || API_TOKEN.length === 0) {
      const message = "Missing API_TOKEN environment variable";

      log.error(message);

      return c.json(
        {
          success: false,
          status: 500,
          message,
        },
        500
      );
    }

    if (!token || token !== API_TOKEN) {
      const message = `${!token ? "Missing" : "Invalid"} authorization token`;

      log.error(message);

      return c.json(
        {
          success: false,
          status: 401,
          message,
        },
        401
      );
    }

    await next();
  };
