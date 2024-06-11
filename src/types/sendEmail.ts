export type Contact = { email: string; name?: string };

export type Content = { type: string; value: string };

export type Personalization = {
  from: Contact;
  to: Contact[];
  reply_to?: Contact;
  cc?: Contact[];
  bcc?: Contact[];
  subject: string;
};

export type Email = {
  headers: Record<string, string>;
  personalizations: Personalization[];
  from: Contact;
  reply_to?: Contact;
  subject: string;
  content: Content[];
};
