export enum LogPrefix {
  Incoming = "-->",
  Outgoing = "<--",
  Error = "[Error]",
}

export type LogFunction = (message: string, ...messages: string[]) => void;

export type Log = {
  info: LogFunction;
  error: LogFunction;
  incoming: LogFunction;
  outgoing: LogFunction;
};
