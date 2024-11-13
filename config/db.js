//  import mysql2 from "mysql2/promise";

 import mysql2 from "mysql2";
// const connection  = mysql2.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER ,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   waitForConnections: true,
//   connectionLimit: 10,
// });

// export default connection ;


const connection  = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos MySQL');
});
export default connection ;
