import mysql2 from "mysql2/promise";

const connection  = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "agenda-consultorio2",
  waitForConnections: true,
  connectionLimit: 10,
});

export default connection ;


