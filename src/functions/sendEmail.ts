import { StatusCode } from "hono/utils/http-status";
import { SendEmailType } from "@/schemas/sendEmail";
import { getEmail } from "@/utils/sendEmail";
import { ResponseType } from "@/types/response";
import { log } from "@/utils/logger";

// TODO: Replace MailChannels API with NodeMailer

export const sendEmail = async (
  data: SendEmailType,
  attempts: number = 3,
  delay: number = 1000
): Promise<ResponseType> => {
  const email = getEmail(data);

  // const url = `https://api.mailchannels.net/tx/v1/send${
  //   data.dryRun ? "?dry-run=true" : ""
  // }`;

  // const options = {
  //   method: "POST",
  //   headers: {
  //     "content-type": "application/json",
  //   },
  //   body: JSON.stringify(email),
  // };

  // let attempt = 0;

  // while (attempt < attempts) {
  //   const response = await fetch(url, options);

  //   if (response.ok) {
  //     const body = await response.json();

  //     return {
  //       success: true,
  //       status: response.status as StatusCode,
  //       message: response.statusText,
  //       body,
  //     };
  //   }

  //   attempt++;

  //   if (attempt < attempts) {
  //     await new Promise((resolve) => setTimeout(resolve, delay));
  //   } else {
  //     const body = await response.text();

  //     return {
  //       success: false,
  //       status: response.status as StatusCode,
  //       message: response.statusText,
  //       body,
  //     };
  //   }
  // }

  // const message = `Failed to send email after ${attempt} attempt${
  //   attempt === 1 ? "" : "s"
  // }`;

  // log.error(message);

  return {
    success: false,
    status: 400 as StatusCode,
    message: "Failed to send email",
    body: email,
  };
};
