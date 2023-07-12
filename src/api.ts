import { Router } from "oak/mod.ts";
import { todosRouter } from "./todos/todos.controller.ts";

export const apiRouter = new Router({ prefix: "/api" })
  .use(todosRouter.routes())
  .use(todosRouter.allowedMethods());
