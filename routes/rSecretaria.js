import { Router } from "express";
import cSecretaria from "../controllers/cSecretaria.js";

const routes = Router();

routes.get("/secretaria", cSecretaria.homeSecretaria);
routes.get("/secretaria/pacientes", cSecretaria.getAddPacienteForm);
// routes.get("/pacientes", secretariaController.getAddPacienteForm);
// routes.post("/pacientes", secretariaController.addPaciente);

// routes.get("/turnos-disponibles", secretariaController.getProfesionales);
// routes.get("/turnos/:profesionalId", secretariaController.getTurnos);

// routes.get("/reservar-turno", secretariaController.getReservaForm);
// routes.post("/reservar-turno", secretariaController.reserveTurno);

export default routes;
