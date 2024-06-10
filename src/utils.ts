import {
  MCContact,
  MCContent,
  MCEmail,
  MCPersonalization,
  Bindings,
} from './types'
import { Contact, Email } from './zod'

export const getMCEmail = (email: Email, env: Bindings): MCEmail => {
  const headers = {
    'X-Entity-Ref-ID': generateRandomId(),
  }

  const to = getMCContacts(email.to)
  const from = getMCContact(email.from)

  const personalizations: MCPersonalization[] = [
    {
      dkim_domain: from.email.split('@')[1],
      dkim_selector: 'mailchannels',
      dkim_private_key: env.DKIM_PRIVATE_KEY,
      from,
      to,
      subject: email.subject,
    },
  ]

  let reply_to: MCContact | undefined

  if (email.replyTo) {
    const replyToContacts = getMCContacts(email.replyTo)

    reply_to =
      replyToContacts.length > 0
        ? replyToContacts[0]
        : { email: '', name: undefined }

    personalizations[0].reply_to = reply_to
  }

  if (email.cc) {
    personalizations[0].cc = getMCContacts(email.cc)
  }

  if (email.bcc) {
    personalizations[0].bcc = getMCContacts(email.bcc)
  }

  const subject = email.subject

  const textContent: MCContent[] = []

  if (email.text) {
    textContent.push({ type: 'text/plain', value: email.text })
  }

  const htmlContent: MCContent[] = []

  if (email.html) {
    htmlContent.push({ type: 'text/html', value: email.html })
  }

  const content: MCContent[] = [...textContent, ...htmlContent]

  return {
    headers,
    personalizations,
    from,
    reply_to,
    subject,
    content,
  }
}

const getMCContacts = (contacts: Contact | Contact[]): MCContact[] => {
  if (!contacts) {
    return []
  }

  const contactArray = Array.isArray(contacts) ? contacts : [contacts]

  const convertedContacts = contactArray.map(getMCContact)

  return convertedContacts
}

const getMCContact = (contact: Contact): MCContact => {
  if (typeof contact === 'string') {
    return { email: contact, name: undefined }
  }

  return { email: contact.email, name: contact.name }
}

const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

const generateRandomId = (length: number = 16): string => {
  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}
