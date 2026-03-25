import mysql from "mysql2/promise";
import { logger } from "../lib/logger";

const {
  MYSQL_HOST = "localhost",
  MYSQL_PORT = "3306",
  MYSQL_USER = "root",
  MYSQL_PASSWORD = "",
  MYSQL_DATABASE = "app_db",
} = process.env;

export const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testConnection(): Promise<void> {
  try {
    const conn = await pool.getConnection();
    conn.release();
    logger.info("MySQL connection established successfully");
  } catch (err) {
    logger.error({ err }, "Failed to connect to MySQL");
    throw err;
  }
}
