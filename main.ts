import "std/dotenv/load.ts";
import { Application } from "oak/mod.ts";
import { initDatabase } from "./src/database/database.ts";
import { apiRouter } from "./src/api.ts";
import { errorMiddleware } from "./src/middleware.ts";

await initDatabase();

await new Application()
  .use(errorMiddleware)
  .use(apiRouter.routes())
  .use(apiRouter.allowedMethods())
  .listen({ port: 8080 });
