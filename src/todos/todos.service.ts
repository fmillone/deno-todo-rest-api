import { ObjectId } from "mongodb";
import { db } from "../database/database.ts";
import { Status } from "./todo.model.ts";

const findTodoById = (id: string) => {
  return db
    .collection("todos")
    .findOne({ _id: new ObjectId(id) });
};

const findAllTodosPaginated = async (limit: number, skip: number) => {
  const list$ = db
    .collection("todos")
    .find()
    .limit(limit)
    .skip(skip)
    .toArray();
  const count$ = db.collection("todos").countDocuments();
  const [list, count] = await Promise.all([list$, count$]);

  return {
    count,
    items: list,
  };
};

const deleteById = (id: string) => {
  return db.collection("todos")
    .deleteOne({ _id: new ObjectId(id) });
};

const saveNewTodo = (todo: RawTodo) => {
  return db
    .collection("todos")
    .insertOne({
      title: todo.title,
      status: todo.status,
    });
};

type RawTodo = { title: string; status: Status };

const updateTodoById = (id: string, { title, status }: RawTodo) => {
  return db
    .collection("todos")
    .replaceOne({ _id: new ObjectId(id) }, { title, status }, {
      upsert: false,
    });
};

export const todoService = {
  findTodoById,
  findAllTodosPaginated,
  deleteById,
  saveNewTodo,
  updateTodoById,
};
