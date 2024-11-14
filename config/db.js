// import dotenv from "dotenv";
// import mysql2 from "mysql2/promise";
// dotenv.config();
// const connection = mysql2.createConnection({
//   host: process.env.MYSQL_HOST || "localhost",
//   user: process.env.MYSQL_USER || "root",
//   password: process.env.MYSQL_PASSWORD || "",
//   database: process.env.MYSQL_DATABASE || "agenda-consultorio2",
//   port: process.env.MYSQL_PORT || 3000,
//   waitForConnections: true,
//   connectionLimit: 10,
// });

// export default connection;

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
