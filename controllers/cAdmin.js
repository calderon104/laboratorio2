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
      } = req.body;

      // Datos del profesional
      const profesionalData = {
        nombre,
        apellido,
        dni,
        email,
        telefono,
        activo: true,
      };

      // Datos de la especialidad del profesional
      const especialidadData = {
        id_especialidad: especialidad_id,
        matricula,
      };

      // Datos de la agenda
      const agendaData = {
        id_especialidad: especialidad_id,
        id_sucursal: sucursal_id || null, // asegúrate de pasar un valor válido si es obligatorio
        fecha_inicio: null, // inicializa según disponibilidad
        fecha_fin: null, // inicializa según disponibilidad
        clasificacion: null, // inicializa según disponibilidad
        max_sobreturnos: null, // inicializa según disponibilidad
      };

      const newMedicoId = await mAdmin.create(
        profesionalData,
        especialidadData,
        agendaData,
        null // Pasando null para horarioData ya que aún no se utiliza
      );

      const sucursales = await mAdmin.getSucursales();
      const especialidades = await mAdmin.getEspecialidades();

      res.render("vAdministrador/abm-medicos", {
        title: "Agregar Médico",
        newMedico: newMedicoId,
        sucursales,
        especialidades,
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

  getMedicos: async (req, res) => {
    try {
      const medicos = await mAdmin.getAllProfesionales(); // Obtiene todos los médicos
      console.log(medicos);
      res.render("vAdministrador/listMedicos", {
        title: "Lista de Médicos",
        medicos,
      });
    } catch (err) {
      console.error("Error al obtener médicos:", err);
      res.status(500).send("Error al obtener médicos");
    }
  },

  getEditMedicoForm: async (req, res) => {
    try {
      const medicoId = req.params.id;
      const medico = await mAdmin.getMedicoById(medicoId); // Obtiene el médico y sus especialidades
      const especialidadesDisponibles =
        await mAdmin.getEspecialidadesDisponibles(medicoId); // Obtiene especialidades disponibles para agregar
      res.render("vAdministrador/modificarMed", {
        title: "Editar Médico",
        medico,
        especialidadesDisponibles,
      });
    } catch (err) {
      console.error(
        "Error al obtener el formulario de edición del médico:",
        err
      );
      res.status(500).send("Error al obtener los datos del médico");
    }
  },

  updateMedico: async (req, res) => {
    try {
      const medicoId = req.params.id;
      const { nombre, apellido, telefono, email } = req.body;
      await mAdmin.updateProfesional(medicoId, {
        nombre,
        apellido,
        telefono,
        email,
      });
      res.redirect(`/admin/medicos/${medicoId}/edit`);
    } catch (err) {
      res.status(500).send("Error al actualizar el médico");
    }
  },

  addSpecialty: async (req, res) => {
    try {
      const medicoId = req.params.id;
      const { especialidad_id, matricula } = req.body; // Asegúrate de recibir la matrícula
      await mAdmin.addEspecialidad(medicoId, especialidad_id, matricula);
      res.redirect(`/admin/medicos/${medicoId}/edit`);
    } catch (err) {
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
      res.status(500).send("Error al eliminar especialidad");
    }
  },

  // Controlador para mostrar todas las agendas
  listAgendas: async (req, res) => {
    try {
      const agendas = await mAdmin.getAllAgendas();
      res.render("vAdministrador/agendas", {
        title: "Listado de Agendas",
        agendas,
      });
    } catch (err) {
      console.error("Error al obtener las agendas:", err);
      error.e500(req, res, err);
    }
  },
  viewAgendaDetails: async (req, res) => {
    try {
      const agendaId = req.params.id;
      const agenda = await mAdmin.getAgendaById(agendaId);
      const sucursales = await mAdmin.getSucursales();
  
      // Asegúrate de que dias_laborables sea un array
      agenda.dias_laborables = agenda.dias_laborables || [];
  
      // Asegúrate de que horarios sea un array
      agenda.horarios = agenda.horarios || [];
  
      res.render("vAdministrador/agenda", {
        title: "Detalles de la Agenda",
        agenda: agenda,
        sucursales: sucursales,
      });
    } catch (err) {
      console.error("Error al obtener los detalles de la agenda:", err);
      error.e500(req, res, err);
    }
  },
  
  updateAgenda: async (req, res) => {
    try {
      const agendaId = req.params.id;
      const {
        sucursal,
        fechaInicio,
        fechaFin,
        clasificacion,
        max_sobreturnos,
        dias,
        horaInicio,
        horaFin,
        duracion,
      } = req.body;
  
      // Validar que los datos requeridos estén presentes
      if (!sucursal || !fechaInicio || !fechaFin || !clasificacion || !max_sobreturnos || !duracion) {
        return res.status(400).send({ message: "Faltan datos obligatorios" });
      }
  
      // Convertir duracion a número
      const duracionTurno = parseInt(duracion, 10);
      if (isNaN(duracionTurno) || duracionTurno <= 0) {
        return res.status(400).send({ message: "Duración del turno inválida" });
      }
  
      // Preparar datos para la tabla 'agenda'
      const agendaData = {
        id_sucursal: sucursal,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        clasificacion: clasificacion,
        max_sobreturnos: parseInt(max_sobreturnos, 10) || 0,
      };
  
      // Preparar horarios
      const horarios = [];
      for (let i = 0; i < horaInicio.length; i++) {
        const diasSeleccionados = Array.isArray(dias[i]) ? dias[i] : [dias[i]];
        diasSeleccionados.forEach(dia => {
          if (dia) {  // Asegurarse de que el día no sea undefined o null
            horarios.push({
              dia_semana: dia,
              hora_inicio: horaInicio[i],
              hora_fin: horaFin[i],
              duracion_turno: duracionTurno,
            });
          }
        });
      }
  
      // Llamar al modelo para actualizar la agenda
      await mAdmin.updateAgenda(agendaId, agendaData, horarios);
  
      // Redirigir a la página de la agenda
      res.redirect(`/admin/agenda/${agendaId}`);
    } catch (err) {
      console.error("Error al actualizar la agenda:", err);
      res.status(500).send({ message: "Error al actualizar la agenda" });
    }
  },
  
};

export default cAdmin;
