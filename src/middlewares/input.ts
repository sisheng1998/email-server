import { Context, MiddlewareHandler } from "hono";
import { ZodSchema } from "zod";
import { HonoResponseType } from "@/types/response";
import { log } from "@/utils/logger";

export const inputMiddleware =
  (schema: ZodSchema): MiddlewareHandler =>
  async (c: Context, next): Promise<HonoResponseType | void> => {
    const data = await c.req.json();
    const result = schema.safeParse(data);

    if (!result.success) {
      const message = "Invalid input";
      const body = result.error.flatten();

      log.error(message, JSON.stringify(body));

      return c.json(
        {
          success: false,
          status: 400,
          message,
          body,
        },
        400
      );
    }

    await next();
  };
