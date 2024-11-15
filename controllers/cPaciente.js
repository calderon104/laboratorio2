import mPacientes from "../models/mPaciente.js";
import mAdministrador from "../models/mAdminitrador.js";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

const cPacientes = {
  getFormMain: (req, res) => {
    res.render("vPaciente/pacienteMain", { title: "Bienvenido" });
  },

  getForm: (req, res) => {
    res.render("vPaciente/paciente", { title: "Registrar Paciente" });
  },

  create: async (req, res) => {
    try {
      const {
        nombre,
        apellido,
        dni,
        fecha_nacimiento,
        telefono,
        email,
        obra_social,
      } = req.body;
      const dni_copia = req.file ? req.file.filename : null;

      const paciente = {
        nombre,
        apellido,
        dni,
        fecha_nacimiento,
        telefono,
        email,
        obra_social,
        dni_copia,
      };
      await mPacientes.create(paciente);
      res.redirect("/pacientesMain");
    } catch (err) {
      console.error("Error al crear paciente:", err);
      res.status(500).render("vPaciente/paciente", {
        title: "Registrar Paciente",
        error:
          "Hubo un problema al registrar el paciente. Inténtalo nuevamente.",
      });
    }
  },

  buscarPorDNI: async (req, res) => {
    try {
      const { dni } = req.body;

      const paciente = await mPacientes.getPacienteByDNI(dni);
      if (!paciente) {
        return res.status(404).render("vPaciente/pacienteMain", {
          title: "Buscar Paciente",
          error: "Paciente no encontrado",
        });
      }

      const medicos = await mAdministrador.getAllProfesionales();

      res.render("vPaciente/pacienteDetalles", {
        title: "Detalles del Paciente",
        paciente,
        medicos,
      });
    } catch (err) {
      console.error("Error al buscar paciente:", err);
      res.status(500).render("vPaciente/pacienteMain", {
        title: "Buscar Paciente",
        error: "Error en la búsqueda del paciente",
      });
    }
  },

  uploadDni: async (req, res) => {
    try {
      const { id } = req.params;
      const dni_copia = req.file ? req.file.filename : null;

      if (!dni_copia) {
        return res.status(400).send("No se subió ningún archivo");
      }

      await mPacientes.updatePaciente(id, { dni_copia });
      res.redirect(`/paciente/${id}`);
    } catch (err) {
      console.error("Error al actualizar fotocopia del DNI:", err);
      res.status(500).send("Error al actualizar datos del paciente");
    }
  },
  reservarTurno: async (req, res) => {
    const { id_turno, dni } = req.body;
    try {
      if (!id_turno || !dni) {
        return res
          .status(400)
          .send({ message: "Faltan datos para reservar el turno" });
      }

      const paciente = await mPacientes.obtenerPacientePorDni(dni);
      if (!paciente) {
        return res.status(404).send({ message: "Paciente no encontrado" });
      }

      await mPacientes.asignarTurnoAPaciente(id_turno, paciente.id);

      res.render(`vPaciente/pacienteMain`, {
        message: "Turno reservado exitosamente",
      }); //mensaje de confimarcion
    } catch (err) {
      console.error("Error al reservar turno:", err);
      res.status(500).send({ message: "Error al reservar turno" });
    }
  },
  verTurnosPorMedico: async (req, res) => {
    const { idMedico } = req.params;
    const { fecha, dni } = req.query;
    const selectedDate = fecha ? new Date(fecha) : new Date();

    try {
      const medico = await mAdministrador.getMedicoById(idMedico);
      if (!medico) {
        return res.status(404).send({ message: "Médico no encontrado" });
      }

      const turnos = await mPacientes.verTurnosDisponiblesPorFecha(
        idMedico,
        format(selectedDate, "yyyy-MM-dd")
      );

      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      const calendarDates = [];
      for (
        let d = firstDayOfMonth;
        d <= lastDayOfMonth;
        d.setDate(d.getDate() + 1)
      ) {
        calendarDates.push(new Date(d));
      }

      res.render("vPaciente/turnos-por-medico", {
        turnos,
        medico,
        dni,
        selectedDate,
        calendarDates,
        formatDate: (date) => format(date, "yyyy-MM-dd"),
        formatDateLocale: (date) =>
          format(date, "dd MMMM yyyy", { locale: es }),
      });
    } catch (err) {
      console.error("Error al obtener turnos para el médico:", err);
      res.status(500).send({ message: "Error al obtener turnos" });
    }
  },
};

export default cPacientes;
