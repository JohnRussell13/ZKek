import { Pool } from "pg";
import { CONFIG } from "./config.js";

export const pool = new Pool({
  connectionString: CONFIG.dbUrl,
});
