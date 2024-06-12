export type VerificationResult = {
  email: string;
  isEmailValid: boolean;
  isDisposable: boolean;
  isMxRecordFound: boolean;
  isSMTPConnected: boolean;
  isEmailExist: boolean;
  isCatchAll: boolean;
};

export type TestEmailResult = Pick<
  VerificationResult,
  "isSMTPConnected" | "isEmailExist" | "isCatchAll"
>;

export enum SMTPStages {
  CONNECT = "CONNECT",
  EHLO = "EHLO",
  MAIL_FROM = "MAIL_FROM",
  RCPT_TO = "RCPT_TO",
  RCPT_TO_CATCH_ALL = "RCPT_TO_CATCH_ALL",
  QUIT = "QUIT",
}

export interface SMTPStage {
  command?: string | ((email: string) => string);
  expected_reply_code: string;
}
