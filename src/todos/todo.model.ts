import type { Document, WithId } from "mongodb";

export class Todo {
  static fromDoc(todo: WithId<Document>) {
    return new Todo(todo._id.toString(), todo.title, todo.status);
  }

  constructor(
    public id: string,
    public title: string,
    public status: Status,
  ) {}
}

export type Status = "TODO" | "IN PROGRESS" | "DONE";
export const ALL_STATUSES: Status[] = ["TODO", "DONE", "IN PROGRESS"];
