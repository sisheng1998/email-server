import { SMTPStage, SMTPStages } from "@/types/verifyEmail";

export const STAGES: Record<SMTPStages, SMTPStage> = {
  [SMTPStages.CONNECT]: { expected_reply_code: "220" },
  [SMTPStages.EHLO]: {
    command: `EHLO example.org\r\n`,
    expected_reply_code: "250",
  },
  [SMTPStages.MAIL_FROM]: {
    command: `MAIL FROM:<name@example.org>\r\n`,
    expected_reply_code: "250",
  },
  [SMTPStages.RCPT_TO]: {
    command: (email: string) => `RCPT TO:<${email}>\r\n`,
    expected_reply_code: "250",
  },
  [SMTPStages.RCPT_TO_CATCH_ALL]: {
    command: (email: string) => `RCPT TO:<${email}>\r\n`,
    expected_reply_code: "250",
  },
  [SMTPStages.QUIT]: {
    command: `QUIT\r\n`,
    expected_reply_code: "221",
  },
};

export const TIMEOUT_DURATION = 3000;
