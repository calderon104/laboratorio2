import { Router } from "express";
import cPacientes from "../controllers/cPaciente.js";
import multer from "multer";
import path from "path";

const routes = Router();

// Configuración de multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `dni_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Rutas
routes.get("/pacientesMain", cPacientes.getFormMain);
routes.post("/pacientes/buscar", cPacientes.buscarPorDNI);
routes.get("/pacientes/registrarse", cPacientes.getForm);

// **Ajustar esta ruta para manejar la subida del archivo**
routes.post("/paciente/registrarse", upload.single("dni_copia"), cPacientes.create);

// routes.get("/paciente/:id", cPacientes.getPacienteById);
routes.post("/paciente/:id/upload", upload.single("dni_copia"), cPacientes.uploadDni);

export default routes;
