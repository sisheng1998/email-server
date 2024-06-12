import net from "node:net";
import { promises, MxRecord } from "node:dns";
import { randomBytes } from "node:crypto";
import psl from "psl";
import { emailSchema } from "@/schemas/verifyEmail";
import { DISPOSABLE_EMAIL_LIST } from "@/constants/disposableEmailList";
import { STAGES, TIMEOUT_DURATION } from "@/constants/verifyEmail";
import { SMTPStages, TestEmailResult } from "@/types/verifyEmail";
import { log } from "@/utils/logger";

export const validateEmailFormat = (email: string): boolean =>
  emailSchema.safeParse(email).success;

export const isEmailDisposable = (domain: string): boolean =>
  DISPOSABLE_EMAIL_LIST.includes(domain);

const resolveMx = (
  domain: string,
  timeout: number = TIMEOUT_DURATION
): Promise<MxRecord[]> =>
  Promise.race([
    promises.resolveMx(domain),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Resolve MX records timeout (${domain})`)),
        timeout
      )
    ),
  ]);

export const getMxRecords = async (domain: string): Promise<MxRecord[]> => {
  try {
    const mxRecords = await resolveMx(domain);
    return mxRecords.sort((a, b) => a.priority - b.priority);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : error?.toString() || "Unknown error occurred";

    log.error(message);
  }

  const mainDomain = psl.get(domain);

  if (!mainDomain || mainDomain.toLowerCase() === domain.toLowerCase()) {
    return [];
  }

  try {
    const mxRecords = await resolveMx(mainDomain);
    return mxRecords.sort((a, b) => a.priority - b.priority);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : error?.toString() || "Unknown error occurred";

    log.error(message);

    return [];
  }
};

const processStage = (
  socket: net.Socket,
  stageName: SMTPStages,
  email?: string
): void => {
  const stage = STAGES[stageName];

  if (!stage.command) return;

  const command =
    typeof stage.command === "function" ? stage.command(email!) : stage.command;

  socket.write(command);

  log.outgoing(command);
};

export const testInbox = async (
  hostname: string,
  email: string
): Promise<TestEmailResult> =>
  new Promise((resolve, reject) => {
    const result: TestEmailResult = {
      isSMTPConnected: false,
      isEmailExist: false,
      isCatchAll: false,
    };

    const socket = net.createConnection(25, hostname);
    let timeout: NodeJS.Timeout;

    let currentStageName = SMTPStages.CONNECT;

    const cleanUp = () => {
      clearTimeout(timeout);
      socket.end();
    };

    timeout = setTimeout(() => {
      cleanUp();
      reject(new Error(`Connection timeout (${hostname})`));
    }, TIMEOUT_DURATION);

    socket.on("connect", () => {
      log.info(`Connected to ${hostname}`);
      clearTimeout(timeout);
      processStage(socket, currentStageName);
    });

    socket.on("data", (data) => {
      const response = data.toString();

      log.incoming(response);

      const currentStage = STAGES[currentStageName];

      if (!response.startsWith(currentStage.expected_reply_code)) {
        cleanUp();
        return;
      }

      if (currentStageName === SMTPStages.CONNECT) {
        result.isSMTPConnected = true;
      } else if (currentStageName === SMTPStages.RCPT_TO) {
        result.isEmailExist = true;
      } else if (currentStageName === SMTPStages.RCPT_TO_CATCH_ALL) {
        result.isCatchAll = true;
      }

      currentStageName = Object.keys(SMTPStages)[
        Object.values(SMTPStages).indexOf(currentStageName) + 1
      ] as SMTPStages;

      if (currentStageName) {
        processStage(
          socket,
          currentStageName,
          currentStageName === "RCPT_TO_CATCH_ALL"
            ? getNonExistentEmail(email.split("@")[1])
            : email
        );
      } else {
        cleanUp();
      }
    });

    socket.on("error", (error) => {
      log.error(error.message);
      cleanUp();
    });

    socket.on("close", () => {
      log.info(`Connection closed (${hostname})`);
      clearTimeout(timeout);
      resolve(result);
    });
  });

const getNonExistentEmail = (domain: string): string =>
  `${randomBytes(8).toString("hex")}@${domain}`;
