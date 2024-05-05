import { z } from 'zod'

const contactSchema = z.union([
  z.string().email(),
  z.object({
    email: z.string().email(),
    name: z.string().optional(),
  }),
])

const emailSchema = z.object({
  to: z.union([contactSchema, z.array(contactSchema)]),
  replyTo: z.union([contactSchema, z.array(contactSchema)]).optional(),
  cc: z.union([contactSchema, z.array(contactSchema)]).optional(),
  bcc: z.union([contactSchema, z.array(contactSchema)]).optional(),
  from: contactSchema,
  subject: z.string().trim().min(1, { message: 'Subject is required' }),
  text: z.string().optional(),
  html: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
})

export type Contact = z.infer<typeof contactSchema>
export type Email = z.infer<typeof emailSchema>

export default emailSchema
