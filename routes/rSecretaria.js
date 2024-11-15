import { Router } from "express";
import cSecretaria from "../controllers/cSecretaria.js";

const routes = Router();

routes.get("/secretaria", cSecretaria.homeSecretaria);
routes.get("/secretaria/agregar-paciente", cSecretaria.getAddPacienteForm);
routes.post("/secretaria/pacientes", cSecretaria.addPaciente);
routes.get("/secretaria/listar-paciente", cSecretaria.listPacientes);
routes.get("/secretaria/consultar-agendas", cSecretaria.getAllAgendas);

export default routes;
