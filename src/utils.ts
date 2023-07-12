import { getQuery } from "oak/helpers.ts";
import type { Context } from "oak/mod.ts";

export async function jsonBody(ctx: Context) {
  try {
    return await ctx.request.body({ type: "json" }).value;
  } catch (error) {
    ctx.throw(422, error.message);
  }
}

export function getQueryNumbers(
  ctx: Context,
  defaultValues: Record<string, number> = {},
): Record<string, number> {
  const query = getQuery(ctx);
  return Object.keys(defaultValues).reduce((acc, it) => {
    if (query[it]) {
      const number = Number(query[it]);
      ctx.assert(!isNaN(number), 400, `'${it}' should be a number`);
      return {
        ...acc,
        [it]: number,
      };
    } else {
      return acc;
    }
  }, defaultValues);
}
