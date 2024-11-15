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
  
      const errores = [];
      if (!nombre || nombre.trim() === "") {
        errores.push("El nombre es obligatorio");
      }
      if (!apellido || apellido.trim() === "") {
        errores.push("El apellido es obligatorio");
      }
      if (!dni || isNaN(dni)) {
        errores.push("El DNI es obligatorio y debe ser un número");
      }
      if (!especialidad_id || isNaN(especialidad_id)) {
        errores.push("Debe seleccionar una especialidad válida");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        errores.push("Debe proporcionar un email válido");
      }
      const telefonoRegex = /^[0-9]{7,15}$/;
      if (!telefono || !telefonoRegex.test(telefono)) {
        errores.push("Debe proporcionar un teléfono válido");
      }

      if (!matricula) {
        errores.push("La matrícula es obligatoria");
      }

      if (sucursal_id && isNaN(sucursal_id)) {
        errores.push("La sucursal debe ser un número");
      }
      if (errores.length > 0) {
        const sucursales = await mAdmin.getSucursales();
        const especialidades = await mAdmin.getEspecialidades();
        return res.status(400).render("vAdministrador/abm-medicos", {
          title: "Agregar Médico",
          errors: errores,
          sucursales,
          especialidades,
        });
      }
      const profesionalData = {
        nombre,
        apellido,
        dni,
        email,
        telefono,
        activo: true,
      };
      const especialidadData = {
        id_especialidad: especialidad_id,
        matricula,
      };
      const agendaData = {
        id_especialidad: especialidad_id,
        id_sucursal: sucursal_id || null,
        fecha_inicio: null,
        fecha_fin: null,
        clasificacion: null,
        max_sobreturnos: null,
      };

      const newMedicoId = await mAdmin.create(
        profesionalData,
        especialidadData,
        agendaData,
        null
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
      console.error("Error al agregar médico:", err);
      error.e500(req, res, err);
    }
  },
  
  baja: async (req, res) => {
    try {
      const medicoId = req.params.id;
      await mAdmin.bajaMedico(medicoId);
      res.redirect('/admin/Allmedicos');
    } catch (err) {
      console.error("Error al desactivar el médico:", err);
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
      const medicos = await mAdmin.getAllProfesionales(); 
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
  obtenerMedicoPorId: async (id) => {
    try {
      const medico = await mAdmin.getMedicoById(id);
      return medico;
    } catch (err) {
      res.status(500).send("Error al obtener el médico");
    }
  },
  getEditMedicoForm: async (req, res) => {
    try {
      const medicoId = req.params.id;
      const medico = await mAdmin.getMedicoById(medicoId); 
      const especialidadesDisponibles =
        await mAdmin.getEspecialidadesDisponibles(medicoId); 
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
      const { especialidad_id, matricula } = req.body; 
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
      await mAdmin.removeEspecialidad(medicoId, especialidadId);
      res.redirect(`/admin/medicos/${medicoId}/edit`);
    } catch (err) {
      res.status(500).send("Error al eliminar especialidad");
    }
  },

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
  
      agenda.dias_laborables = agenda.dias_laborables || [];
  
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
  
      if (!sucursal || !fechaInicio || !fechaFin || !clasificacion || !max_sobreturnos || !duracion) {
        return res.status(400).send({ message: "Faltan datos obligatorios" });
      }
  
      const duracionTurno = parseInt(duracion, 10);
      if (isNaN(duracionTurno) || duracionTurno <= 0) {
        return res.status(400).send({ message: "Duración del turno inválida" });
      }
  
      const agendaData = {
        id_sucursal: sucursal,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        clasificacion: clasificacion,
        max_sobreturnos: parseInt(max_sobreturnos, 10) || 0,
      };

      const horarios = [];
      for (let i = 0; i < horaInicio.length; i++) {
        const diasSeleccionados = Array.isArray(dias[i]) ? dias[i] : [dias[i]];
        diasSeleccionados.forEach(dia => {
          if (dia) { 
            horarios.push({
              dia_semana: dia,
              hora_inicio: horaInicio[i],
              hora_fin: horaFin[i],
              duracion_turno: duracionTurno,
            });
          }
        });
      }

      await mAdmin.updateAgenda(agendaId, agendaData, horarios, fechaInicio, fechaFin);
  
      res.redirect(`/admin/agenda/${agendaId}`);
    } catch (err) {
      console.error("Error al actualizar la agenda:", err);
      res.status(500).send({ message: "Error al actualizar la agenda" });
    }
  },
  verTurnosPorMedico: async (idMedico) => {
    try {
      const [result] = await db.query(`
        SELECT t.id, t.fecha, t.hora_inicio, t.hora_fin
        FROM turno t
        JOIN agenda a ON t.id_agenda = a.id
        WHERE a.id_profesional = ? AND t.id_paciente IS NULL AND t.estado = 'disponible'
        ORDER BY t.fecha, t.hora_inicio;
      `, [idMedico]);
      return result;
    } catch (err) {
      throw { status: 500, message: "Error al obtener los turnos por médico" };
    }
  },
};

export default cAdmin;
