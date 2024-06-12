import { z } from "zod";

export const emailSchema = z.string().email();

export const verifyEmailSchema = z.object({
  email: z.string().trim().min(1, { message: "Email is required" }),
});

export type VerifyEmailType = z.infer<typeof verifyEmailSchema>;
