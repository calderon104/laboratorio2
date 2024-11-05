import mAdmin from "../models/mAdminitrador.js";
import error from "../middlewares/error.js";
const cAdmin = {

  homeAdmin: (req, res) => {
    res.render("vAdministrador/administrador");
  },
  
  create: async (req, res) => {
    try {
      const {
        nombre,
        apellido,
        dni,
        especialidad_id,
        email,
        telefono,
        matricula,
        sucursal_id,
        fechaInicio,
        fechaFin,
        dias,
        horaInicio,
        horaFin,
      } = req.body;

      // OBJ profesional
      const profesionalData = { 
        nombre, 
        apellido, 
        dni, 
        email, 
        telefono,
        activo: true
      };
      //especialidad
      const especialidadData = { especialidad_id, matricula };
      //agenda
      const agendaData = {
        sucursal_id,
        tipo_clasificacion: "tipoA",
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      };
      //faltaria agregar horario
      const diasLaborables = Array.isArray(dias) ? dias : [dias];
      
      const newMedicoId = await mAdmin.create(profesionalData, especialidadData, agendaData, diasLaborables);
      const sucursales = await mAdmin.getSucursales();
      const especialidades = await mAdmin.getEspecialidades();
      
      res.render("vAdministrador/abm-medicos", { 
        title: "Agregar Médico", 
        newMedico: newMedicoId,
        sucursales,
        especialidades
      });
    } catch (err) {
      error.e500(req, res, err);
    }
  },
  
  getAddMedicoForm: async (req, res) => {
    try {
      const sucursales = await mAdmin.getSucursales();
      const especialidades = await mAdmin.getEspecialidades();
      res.render("vAdministrador/abm-medicos", { sucursales, especialidades });
    } catch (err) {
      error.e500(req, res, err);
    }
  },

  getAddHorarioForm: (req, res) => {
    res.render("vAdministrador/diasLaborables");
  },
  getMedicos: async (req, res) => {
    try {
      const medicos = await mAdmin.getAllProfesionales(); // Obtiene todos los médicos
      res.render("vAdministrador/listMedicos", { title: "Lista de Médicos", medicos });
    } catch (err) {
      console.error("Error al obtener médicos:", err);
      res.status(500).send("Error al obtener médicos");
    }
  },

  getEditMedicoForm: async (req, res) => {
    try {
      const medicoId = req.params.id;
      const medico = await mAdmin.getMedicoById(medicoId); // Obtiene el médico y sus especialidades
      const especialidadesDisponibles = await mAdmin.getEspecialidadesDisponibles(medicoId); // Obtiene especialidades disponibles para agregar
      res.render("vAdministrador/modificarMed", {
        title: "Editar Médico",
        medico,
        especialidadesDisponibles
      });
    } catch (err) {
      console.error("Error al obtener el formulario de edición del médico:", err);
      res.status(500).send("Error al obtener los datos del médico");
    }
  },

  updateMedico: async (req, res) => {
    try {
      const medicoId = req.params.id;
      const { nombre, apellido, telefono, email } = req.body;
      await mAdmin.updateMedico(medicoId, { nombre, apellido, telefono, email });
      res.redirect(`/admin/medicos/${medicoId}/edit`);
    } catch (err) {
      console.error("Error al actualizar el médico:", err);
      res.status(500).send("Error al actualizar el médico");
    }
  },

  addSpecialty: async (req, res) => {
    try {
      const medicoId = req.params.id;
      const { especialidad_id, matricula } = req.body;  // Asegúrate de recibir la matrícula
      await mAdmin.addSpecialty(medicoId, especialidad_id, matricula);
      res.redirect(`/admin/medicos/${medicoId}/edit`);
    } catch (err) {
      console.error("Error al agregar especialidad:", err);
      res.status(500).send("Error al agregar especialidad");
    }
  },
  

  removeSpecialty: async (req, res) => {
    try {
      const medicoId = req.params.id;
      const especialidadId = req.params.especialidadId;
      await mAdmin.removeSpecialty(medicoId, especialidadId);
      res.redirect(`/admin/medicos/${medicoId}/edit`);
    } catch (err) {
      console.error("Error al eliminar especialidad:", err);
      res.status(500).send("Error al eliminar especialidad");
    }
  },
};

export default cAdmin;
