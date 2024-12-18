import { Router } from "express";
import cAdmin from "../controllers/cAdmin.js";
const routes = Router();

routes.get("/admin", cAdmin.homeAdmin);
routes.get("/admin/medicos", cAdmin.getAddMedicoForm);
routes.post("/admin/medicos", cAdmin.create);
routes.get("/admin/Allmedicos", cAdmin.getMedicos); // Ruta para ver la lista de médicos
routes.get("/admin/medicos/:id/edit", cAdmin.getEditMedicoForm); // Ruta para ver la vista de edición de un médico
routes.post("/admin/medicos/:id/edit", cAdmin.updateMedico); // Ruta para actualizar datos de un médico
routes.post("/admin/medicos/:id/add-specialty", cAdmin.addSpecialty); // Ruta para agregar especialidad
routes.get("/admin/medicos/:id/remove-specialty/:especialidadId", cAdmin.removeSpecialty); // Ruta para eliminar especialidad
routes.post("/admin/medicos/:id/delete", cAdmin.baja);
// routes.get("/admin/agenda/:id", cAdmin.getAgendaMedico);
routes.get("/admin/agenda", cAdmin.listAgendas);
routes.get("/admin/agenda/:id", cAdmin.viewAgendaDetails);
routes.post("/admin/agenda/update/:id", cAdmin.updateAgenda);
export default routes;


