import { Router } from "express";
import cPacientes from "../controllers/cPaciente.js";

const routes = Router();

routes.get("/pacientes", cPacientes.getForm);
routes.post("/pacientes", cPacientes.create);


export default routes;
