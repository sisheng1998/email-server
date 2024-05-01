export type Bindings = {
  AUTH_TOKEN: string
  DKIM_PRIVATE_KEY: string
}

export type Contact = { email: string; name?: string }

export type Content = { type: string; value: string }

export type Personalization = { to: Contact[] }

export type Email = {
  personalizations: Personalization[]
  from: Contact
  reply_to?: Contact
  cc?: Contact[]
  bcc?: Contact[]
  subject: string
  content: Content[]
}
