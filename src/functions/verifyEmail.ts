import { VerifyEmailType } from "@/schemas/verifyEmail";
import { VerificationResult } from "@/types/verifyEmail";
import { ResponseType } from "@/types/response";
import {
  getMxRecords,
  isEmailDisposable,
  testInbox,
  validateEmailFormat,
} from "@/utils/verifyEmail";

export const verifyEmail = async (
  data: VerifyEmailType
): Promise<ResponseType> => {
  const { email } = data;

  const body: VerificationResult = {
    email,
    isEmailValid: false,
    isDisposable: false,
    isMxRecordFound: false,
    isSMTPConnected: false,
    isEmailExist: false,
    isCatchAll: false,
  };

  try {
    const isEmailValid = validateEmailFormat(email);

    if (!isEmailValid)
      return {
        success: true,
        status: 200,
        message: "Verification completed",
        body,
      };

    body.isEmailValid = true;

    const [_, domain] = email.split("@");

    body.isDisposable = isEmailDisposable(domain);

    const mxRecords = await getMxRecords(domain);

    if (mxRecords.length === 0)
      return {
        success: true,
        status: 200,
        message: "Verification completed",
        body,
      };

    body.isMxRecordFound = true;

    let index = 0;

    while (index < mxRecords.length) {
      try {
        const { isSMTPConnected, isEmailExist, isCatchAll } = await testInbox(
          mxRecords[index].exchange,
          email
        );

        body.isSMTPConnected = isSMTPConnected;
        body.isEmailExist = isEmailExist;
        body.isCatchAll = isCatchAll;

        if (isSMTPConnected) break;

        index++;
      } catch (error) {
        throw error;
      }
    }

    return {
      success: true,
      status: 200,
      message: "Verification completed",
      body,
    };
  } catch (error) {
    throw error;
  }
};
