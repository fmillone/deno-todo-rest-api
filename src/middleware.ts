import { isHttpError, Middleware, Status } from "oak/mod.ts";

export const errorMiddleware: Middleware = async (ctx, next) => {
  const log =
    `${ctx.request.method} ${ctx.request.url.pathname}${ctx.request.url.search}`;
  try {
    await next();
    console.log("I:", log, ctx.response.status);
  } catch (error) {
    if (isHttpError(error)) {
      ctx.response.type = "json";
      ctx.response.status = error.status;
      ctx.response.body = {
        ...error,
        message: error.message,
        status: error.status,
      };
      console.log("I:", log, error.status, {
        ...error,
        message: error.message,
      });
    } else {
      console.error("E:", log, 500, { ...error, message: error.message });
      ctx.throw(Status.InternalServerError, "Unexpected Error");
    }
  }
};
