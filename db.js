import 'dotenv/config' 
import postgres from "postgres";

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
export const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
});