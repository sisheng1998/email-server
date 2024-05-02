export type Bindings = {
  AUTH_TOKEN: string
  DKIM_PRIVATE_KEY: string
}

export type MCContact = { email: string; name?: string }

export type MCContent = { type: string; value: string }

export type MCPersonalization = {
  dkim_domain: string
  dkim_selector: string
  dkim_private_key: string
  to: MCContact[]
  cc?: MCContact[]
  bcc?: MCContact[]
}

export type MCEmail = {
  personalizations: MCPersonalization[]
  from: MCContact
  reply_to?: MCContact
  subject: string
  content: MCContent[]
}
