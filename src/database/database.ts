import { Db, MongoClient } from "mongodb";

export let client: MongoClient;
export let db: Db;

export async function initDatabase(url?: string) {
  if (!client) {
    client = new MongoClient(url || Deno.env.get("MONGODB_URL")!);
    await client.connect();
    db = client.db("todos");
  }
}
