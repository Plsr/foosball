import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type SqlClient = ReturnType<typeof postgres>;

const globalForDatabase = globalThis as typeof globalThis & {
  foosballSqlClient?: SqlClient;
};

function getSqlClient(): SqlClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const client =
    globalForDatabase.foosballSqlClient ??
    postgres(databaseUrl, {
      max: 1,
      prepare: false,
    });

  globalForDatabase.foosballSqlClient = client;

  return client;
}

export function getDatabase() {
  return drizzle(getSqlClient(), { schema });
}
