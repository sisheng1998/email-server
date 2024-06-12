import { TypedResponse } from "hono";
import { StatusCode } from "hono/utils/http-status";

export type ResponseType = {
  success: boolean;
  status: StatusCode;
  message: string;
  body?: Record<string, any>;
};

export type HonoResponseType = Response & TypedResponse<ResponseType>;
