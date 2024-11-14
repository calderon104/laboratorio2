import dotenv from "dotenv";
dotenv.config(); // Asegúrate de que esta línea esté antes de cualquier uso de process.env

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
// import error from "./middlewares/error.js";
import rPaciente from "./routes/rPacientes.js";
import rSecretaria from "./routes/rSecretaria.js";
import rMain from "./routes/rMain.js";
import rAdmin from "./routes/rAdmin.js";
// import {isAuthenticated} from "./middlewares/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rMain);
app.use(rPaciente);
app.use(rSecretaria);
app.use(rAdmin);
//app.use(isAuthenticated,rSecretaria)
//app.use(error.e404);

app.use((req, res, next) => {
  res.status(404).render("error", { message: "Página no encontrada" });
});

// Manejo de errores 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { message: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
