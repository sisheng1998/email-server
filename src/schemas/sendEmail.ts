import { z } from "zod";
import { emailSchema } from "@/schemas/verifyEmail";

const contactSchema = z.union([
  emailSchema,
  z.object({
    email: emailSchema,
    name: z.string().optional(),
  }),
]);

export type ContactType = z.infer<typeof contactSchema>;

export const sendEmailSchema = z.object({
  headers: z.record(z.string()).optional(),
  to: z.union([contactSchema, z.array(contactSchema)]),
  replyTo: z.union([contactSchema, z.array(contactSchema)]).optional(),
  cc: z.union([contactSchema, z.array(contactSchema)]).optional(),
  bcc: z.union([contactSchema, z.array(contactSchema)]).optional(),
  from: contactSchema,
  subject: z.string().trim().min(1, { message: "Subject is required" }),
  text: z.string().optional(),
  html: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

export type SendEmailType = z.infer<typeof sendEmailSchema>;
