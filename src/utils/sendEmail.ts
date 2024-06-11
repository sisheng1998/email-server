import { Contact, Content, Email, Personalization } from "@/types/sendEmail";
import { ContactType, SendEmailType } from "@/schemas/sendEmail";

export const getEmail = (email: SendEmailType): Email => {
  const headers = {
    "X-Entity-Ref-ID": generateRandomId(),
    ...email.headers,
  };

  const to = getContacts(email.to);
  const from = getContact(email.from);

  const personalizations: Personalization[] = [
    {
      from,
      to,
      subject: email.subject,
    },
  ];

  let reply_to: Contact | undefined;

  if (email.replyTo) {
    const replyToContacts = getContacts(email.replyTo);

    reply_to =
      replyToContacts.length > 0
        ? replyToContacts[0]
        : { email: "", name: undefined };

    personalizations[0].reply_to = reply_to;
  }

  if (email.cc) {
    personalizations[0].cc = getContacts(email.cc);
  }

  if (email.bcc) {
    personalizations[0].bcc = getContacts(email.bcc);
  }

  const subject = email.subject;

  const textContent: Content[] = [];

  if (email.text) {
    textContent.push({ type: "text/plain", value: email.text });
  }

  const htmlContent: Content[] = [];

  if (email.html) {
    htmlContent.push({ type: "text/html", value: email.html });
  }

  const content: Content[] = [...textContent, ...htmlContent];

  return {
    headers,
    personalizations,
    from,
    reply_to,
    subject,
    content,
  };
};

const getContacts = (contacts: ContactType | ContactType[]): Contact[] => {
  if (!contacts) {
    return [];
  }

  const contactArray = Array.isArray(contacts) ? contacts : [contacts];

  const convertedContacts = contactArray.map(getContact);

  return convertedContacts;
};

const getContact = (contact: ContactType): Contact => {
  if (typeof contact === "string") {
    return { email: contact, name: undefined };
  }

  return { email: contact.email, name: contact.name };
};

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateRandomId = (length: number = 16): string => {
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};
