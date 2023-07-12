import { Application } from "oak/application.ts";
import { afterAll, beforeEach, describe, it } from "std/testing/bdd.ts";
import { superoak } from "superoak/mod.ts";
import { apiRouter } from "../../src/api.ts";
import { resolvesNext, Stub, stub } from "std/testing/mock.ts";
import { todoService } from "../../src/todos/todos.service.ts";
import { ObjectId } from "mongodb";

describe("todos controller", () => {
  let app: Application;
  const activeStubs: Stub[] = [];
  beforeEach(() => {
    app = new Application()
      .use(apiRouter.routes())
      .use(apiRouter.allowedMethods());
    activeStubs.forEach((it) => it.restore());
    activeStubs.splice(0, activeStubs.length);
  });

  afterAll(() => {
    activeStubs.forEach((it) => it.restore());
  });

  it("should return a single todo ", async () => {
    activeStubs.push(stub(
      todoService,
      "findTodoById",
      resolvesNext([todos.singleValidTODO]),
    ));
    const request = await superoak(app);
    await request.get("/api/todos/64ae28d1c01239aaf337a01f")
      .expect({
        id: "64ae28d1c01239aaf337a01f",
        title: "some title",
        status: "TODO",
      });
  });

  it("should return a paginated list of todos", async () => {
    activeStubs.push(stub(
      todoService,
      "findAllTodosPaginated",
      resolvesNext([{
        count: 11,
        items: [todos.singleValidTODO],
      }]),
    ));
    const request = await superoak(app);
    await request.get("/api/todos?limit=5&skip=10")
      .expect({
        count: 11,
        items: [{
          id: "64ae28d1c01239aaf337a01f",
          title: "some title",
          status: "TODO",
        }],
      });
  });

  it("should delete a todo by id", async () => {
    activeStubs.push(stub(
      todoService,
      "deleteById",
      resolvesNext([{
        deletedCount: 1,
        acknowledged: true,
      }]),
    ));
    const request = await superoak(app);
    await request.delete("/api/todos/64ae28d1c01239aaf337a01f")
      .expect(200);
  });

  it("should save a todo", async () => {
    activeStubs.push(stub(
      todoService,
      "saveNewTodo",
      resolvesNext([{
        insertedId: new ObjectId("64ae28d1c01239aaf337a01f"),
        acknowledged: true,
      }]),
    ));
    const request = await superoak(app);
    await request.post("/api/todos")
      .set("Content-Type", "application/json")
      .send({ title: "some title", status: "TODO" })
      .expect(201);
  });

  it("should update a todo", async () => {
    activeStubs.push(stub(
      todoService,
      "updateTodoById",
      resolvesNext([{
        modifiedCount: 1,
        acknowledged: true,
      }]),
    ));
    const request = await superoak(app);
    await request.put("/api/todos/64ae28d1c01239aaf337a01f")
      .set("Content-Type", "application/json")
      .send({ title: "some title", status: "IN PROGRESS" })
      .expect({
        "64ae28d1c01239aaf337a01f": "updated",
      });
  });
});

const todos = {
  singleValidTODO: {
    _id: new ObjectId("64ae28d1c01239aaf337a01f"),
    title: "some title",
    status: "TODO",
  },
};
