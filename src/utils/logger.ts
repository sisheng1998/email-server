import fs from "node:fs";
import path from "node:path";
import { Log, LogFunction, LogPrefix } from "@/types/logger";

export const log: Log = {
  info: (message, ...messages) => logMessage(message, ...messages),
  error: (message, ...messages) =>
    logMessage(LogPrefix.Error, message, ...messages),
  incoming: (message, ...messages) =>
    logMessage(LogPrefix.Incoming, message, ...messages),
  outgoing: (message, ...messages) =>
    logMessage(LogPrefix.Outgoing, message, ...messages),
};

const humanize = (times: string[]) => {
  const [delimiter, separator] = [",", "."];

  const orderTimes = times.map((v) =>
    v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter)
  );

  return orderTimes.join(separator);
};

export const time = (start: number) => {
  const delta = Date.now() - start;

  return humanize([
    delta < 1000 ? delta + "ms" : Math.round(delta / 1000) + "s",
  ]);
};

const logMessage: LogFunction = (message, ...messages) => {
  const timestamp = new Date().toISOString();

  const logEntry = `[${timestamp}] (${formatDate(
    timestamp
  )}) ${message.trim()} ${messages.map((m) => m.trim()).join(" ")}`;

  console.log(logEntry);

  const logFolder = path.join(process.cwd(), "logs");

  if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder);
  }

  const filename = getCurrentDate(timestamp);

  fs.appendFile(
    path.join(logFolder, `${filename}.log`),
    logEntry + "\n",
    (error) => error && console.error("Failed to write log to file:", error)
  );
};

const TIME_ZONE = "Asia/Kuala_Lumpur";

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TIME_ZONE,
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  };

  const humanFriendlyDate = date.toLocaleDateString("en-GB", dateOptions);
  const humanFriendlyTime = date.toLocaleTimeString("en-US", timeOptions);

  return `${humanFriendlyDate}, ${humanFriendlyTime}`;
};

const getCurrentDate = (timestamp: string) => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};
