import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import "dotenv/config";
import { authMiddleware } from "@/middlewares/auth";
import { inputMiddleware } from "@/middlewares/input";
import { HonoResponseType } from "@/types/response";
import { SendEmailType, sendEmailSchema } from "@/schemas/sendEmail";
import { sendEmail } from "@/functions/sendEmail";
import { VerifyEmailType, verifyEmailSchema } from "@/schemas/verifyEmail";
import { verifyEmail } from "@/functions/verifyEmail";
import { logger } from "@/middlewares/logger";
import { log } from "@/utils/logger";

const app = new Hono();

app.use("*", cors());

app.use(logger());

app.get("/", (c) => c.redirect("https://sisheng.my", 302));

app.post(
  "/send",
  authMiddleware(),
  inputMiddleware(sendEmailSchema),
  async (c): Promise<HonoResponseType> => {
    const data: SendEmailType = await c.req.json();

    try {
      const response = await sendEmail(data, c);
      return c.json(response, response.status);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : error?.toString() || "Unknown error occurred";

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
  }
);

app.post(
  "/verify",
  authMiddleware(),
  inputMiddleware(verifyEmailSchema),
  async (c): Promise<HonoResponseType> => {
    const data: VerifyEmailType = await c.req.json();

    try {
      const response = await verifyEmail(data);
      return c.json(response, response.status);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : error?.toString() || "Unknown error occurred";

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
  }
);

app.notFound(
  (c): HonoResponseType =>
    c.json({ success: false, status: 404, message: "Not found" }, 404)
);

app.onError((error, c): HonoResponseType => {
  const message = error.message || "Unknown error occurred";

  log.error(message);

  return c.json({ success: false, status: 500, message }, 500);
});

const port = Number(process.env.PORT || 8787);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    log.info(
      info.port ? `Server is running on port ${info.port}` : "Server is running"
    );
  }
);
