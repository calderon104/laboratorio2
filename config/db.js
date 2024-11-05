import mysql2 from "mysql2/promise";

const connection  = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "agenda-consultorio2",
  waitForConnections: true,
  connectionLimit: 10,
});

export default connection ;
