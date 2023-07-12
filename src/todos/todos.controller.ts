import type { Middleware } from "oak/mod.ts";
import { Router } from "oak/router.ts";
import { todoService } from "./todos.service.ts";
import { getQuery } from "oak/helpers.ts";
import type { Context } from "oak/context.ts";
import { getQueryNumbers, jsonBody } from "../utils.ts";
import { ALL_STATUSES, Todo } from "./todo.model.ts";
import { ObjectId } from "mongodb";

const getById: Middleware = async (ctx: Context) => {
  const { id } = getQuery(ctx, { mergeParams: true });
  ctx.assert(id, 400, "id is missing");
  ctx.assert(idIsValid(id), 400, "invalid id");

  const todo = await todoService.findTodoById(id);

  ctx.response.type = "json";
  if (todo) {
    ctx.response.body = Todo.fromDoc(todo);
    ctx.assert(id, 400, "id is missing");
    ctx.response.status = 200;
  } else {
    ctx.response.status = 404;
  }
};

const getAllTodos: Middleware = async (ctx: Context) => {
  const { limit, skip } = getQueryNumbers(ctx, { limit: 10, skip: 0 });

  const { count, items } = await todoService.findAllTodosPaginated(limit, skip);

  ctx.response.body = {
    count,
    items: items.map(Todo.fromDoc),
  };
  ctx.response.type = "json";
  ctx.response.status = 200;
};

const deleteTodo: Middleware = async (ctx: Context) => {
  const { id } = getQuery(ctx, { mergeParams: true });
  ctx.assert(id, 400, "id is missing");
  ctx.assert(idIsValid(id), 400, "invalid id");

  await todoService.deleteById(id);

  ctx.response.type = "json";
  ctx.response.status = 200;
};

const saveTodo: Middleware = async (ctx: Context) => {
  const todo = await jsonBody(ctx);
  ctx.assert(todo.title, 400, 'Property "title" is missing');
  ctx.assert(todo.status, 400, 'Property "status" is missing');
  ctx.assert(
    ALL_STATUSES.includes(todo.status?.toUpperCase()),
    400,
    "invalid status",
  );

  const saved = await todoService.saveNewTodo({
    title: todo.title,
    status: todo.status.toUpperCase(),
  });

  ctx.response.type = "json";
  ctx.response.status = 201;
  ctx.response.body = saved;
};

const updateTodo: Middleware = async (ctx: Context) => {
  const { id } = getQuery(ctx, { mergeParams: true });
  ctx.assert(id, 400, "id is missing");
  ctx.assert(idIsValid(id), 400, "invalid id");
  const { title, status } = (await jsonBody(ctx)) || {};
  ctx.assert(title, 400, 'Property "title" is missing');
  ctx.assert(status, 400, 'Property "status" is missing');
  ctx.assert(
    ALL_STATUSES.includes(status?.toUpperCase()),
    400,
    "invalid status",
  );

  const updated = await todoService.updateTodoById(id, {
    title,
    status: status.toUpperCase(),
  });

  ctx.assert(updated.modifiedCount === 1, 400, "invalid id");

  ctx.response.type = "json";
  ctx.response.status = 200;
  ctx.response.body = {
    [id]: "updated",
  };
};

function idIsValid(id: string) {
  try {
    return !!new ObjectId(id);
  } catch {
    return false;
  }
}

export const todosRouter = new Router({ prefix: "/todos" })
  .get("/", getAllTodos)
  .post("/", saveTodo)
  .get("/:id", getById)
  .put("/:id", updateTodo)
  .delete("/:id", deleteTodo);
