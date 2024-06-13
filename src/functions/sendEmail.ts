import { Context } from "hono";
import { SendEmailType } from "@/schemas/sendEmail";
import { getEmail, getPreviewUrl, getTransporter } from "@/utils/sendEmail";
import { ResponseType } from "@/types/response";

export const sendEmail = async (
  data: SendEmailType,
  c: Context
): Promise<ResponseType> => {
  const email = getEmail(data);
  const dryRun = data.dryRun;

  try {
    const transporter = await getTransporter({ c, dryRun });

    const info = await transporter.sendMail(email);
    const previewUrl = dryRun ? getPreviewUrl(info) : false;

    return {
      success: true,
      status: 200,
      message: dryRun ? "Email sent in dry run mode" : "Email sent",
      body: {
        messageId: info.messageId,
        ...(previewUrl && { previewUrl }),
      },
    };
  } catch (error) {
    throw error;
  }
};
