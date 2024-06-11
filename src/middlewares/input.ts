import { Context, MiddlewareHandler } from "hono";
import { ZodSchema } from "zod";
import { log } from "@/utils/logger";

export const inputMiddleware =
  (schema: ZodSchema): MiddlewareHandler =>
  async (c: Context, next) => {
    const data = await c.req.json();
    const result = schema.safeParse(data);

    if (!result.success) {
      const message = "Invalid input";
      const issues = result.error.flatten();

      log.error(message, JSON.stringify(issues));

      return c.json(
        {
          success: false,
          message,
          issues,
        },
        400
      );
    }

    await next();
  };
