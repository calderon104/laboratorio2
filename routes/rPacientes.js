import { Router } from "express";
import cPacientes from "../controllers/cPaciente.js";
import multer from "multer";
import path from "path";

const routes = Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/uploads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `dni_${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

// const upload = multer({ storage });
const upload = multer({ storage: multer.memoryStorage() });
// Rutas
routes.get("/pacientesMain", cPacientes.getFormMain);
routes.post("/pacientes/buscar", cPacientes.buscarPorDNI);
routes.get("/pacientes/registrarse", cPacientes.getForm);
routes.post("/paciente/:id/upload", upload.single("dni_copia"), cPacientes.uploadDni);
routes.post("/paciente/registrarse", upload.single("dni_copia"), cPacientes.create);
// routes.get('/turnos-disponibles', cPacientes.verTurnosDisponibles);
routes.post('/reservar-turno', cPacientes.reservarTurno);
routes.get('/turnos/:idMedico', cPacientes.verTurnosPorMedico); 
// routes.get('/mis-turnos', cPacientes.verMisTurnos);

export default routes;
