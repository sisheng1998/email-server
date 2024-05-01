import { z } from 'zod'

const contactSchema = z.union([
  z.string(),
  z.object({
    email: z.string(),
    name: z.string().optional(),
  }),
])

const emailSchema = z.object({
  to: z.union([contactSchema, z.array(contactSchema)]),
  replyTo: z.union([contactSchema, z.array(contactSchema)]).optional(),
  cc: z.union([contactSchema, z.array(contactSchema)]).optional(),
  bcc: z.union([contactSchema, z.array(contactSchema)]).optional(),
  from: contactSchema,
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
})

export type Contact = z.infer<typeof contactSchema>
export type Email = z.infer<typeof emailSchema>

export default emailSchema
