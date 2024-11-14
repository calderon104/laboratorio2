import mysql2 from "mysql2/promise";

const connection = mysql2.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: process.env.MYSQL_ADDON_PORT || 3306, // Asegúrate de agregar el puerto también
  waitForConnections: true,
  connectionLimit: 10,
});

export default connection;
