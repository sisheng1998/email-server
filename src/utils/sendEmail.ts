import { Context } from "hono";
import { env } from "hono/adapter";
import nodemailer, {
  SendMailOptions,
  SentMessageInfo,
  Transporter,
} from "nodemailer";
import { ENV } from "@/types/env";
import { ContactType, SendEmailType } from "@/schemas/sendEmail";

export const getTransporter = async ({
  c,
  dryRun = false,
}: {
  c: Context;
  dryRun?: boolean;
}): Promise<Transporter> => {
  if (!dryRun) {
    const { SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD } = env<ENV>(c);

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
    });

    return transporter;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return transporter;
  } catch (error) {
    throw error;
  }
};

export const getPreviewUrl = (info: SentMessageInfo) =>
  nodemailer.getTestMessageUrl(info);

export const getEmail = (email: SendEmailType): SendMailOptions => {
  const headers = {
    "X-Entity-Ref-ID": generateRandomId(),
    ...email.headers,
  };

  const to = getContacts(email.to);
  const replyTo = getContacts(email.replyTo);
  const cc = getContacts(email.cc);
  const bcc = getContacts(email.bcc);
  const from = getContact(email.from);
  const subject = email.subject;
  const text = email.text;
  const html = email.html;

  return {
    headers,
    to,
    replyTo,
    cc,
    bcc,
    from,
    subject,
    text,
    html,
  };
};

const getContacts = (
  contacts: ContactType | ContactType[] | undefined
): SendMailOptions["to"] => {
  if (!contacts || (Array.isArray(contacts) && contacts.length === 0))
    return undefined;

  const contactArray = Array.isArray(contacts) ? contacts : [contacts];
  const convertedContacts = contactArray.map(getContact);

  return convertedContacts;
};

const getContact = (
  contact: ContactType
): NonNullable<SendMailOptions["from"]> =>
  typeof contact === "string"
    ? contact
    : contact.name
    ? { address: contact.email, name: contact.name }
    : contact.email;

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
