import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // Asegúrate de que sea 3306
});

export default connection;
