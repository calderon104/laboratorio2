import dotenv from "dotenv";
import mysql2 from "mysql2/promise";
dotenv.config();
const connection  = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "agenda-consultorio2",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

export default connection ;


