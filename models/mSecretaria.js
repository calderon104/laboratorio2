import db from "../config/db.js";
import { format, parseISO, isDate } from "date-fns";
import { es } from "date-fns/locale";

const mSecretaria = {
  create: async (paciente) => {
    try {
      const [result] = await db.query("INSERT INTO paciente SET ?", [paciente]);
      return result.insertId;
    } catch (err) {
      throw { status: 500, message: "Error al añadir el paciente" };
    }
  },

  getAllPacientes: async () => {
    try {
      const [rows] = await db.query("SELECT * FROM paciente");
      return rows;
    } catch (err) {
      throw { status: 500, message: "Error al obtener pacientes" };
    }
  },
  getAllAgendas: async (filters) => {
    const connection = await db.getConnection();
    try {
      const { id_medico, id_especialidad, fecha } = filters;

      let query = `
        SELECT 
          agenda.id,
          agenda.fecha_inicio AS fecha,
          horario_laboral.hora_inicio,
          horario_laboral.hora_fin,
          profesional.nombre AS nombre_medico,
          profesional.apellido AS apellido_medico,
          especialidad.nombre AS especialidad,
          agenda.clasificacion AS estado
        FROM agenda
        JOIN profesional ON agenda.id_profesional = profesional.id
        JOIN especialidad ON agenda.id_especialidad = especialidad.id
        JOIN horario_laboral ON agenda.id = horario_laboral.id_agenda
        WHERE 1 = 1
      `;
      const params = [];

      if (id_medico) {
        query += " AND agenda.id_profesional = ?";
        params.push(id_medico);
      }
      if (id_especialidad) {
        query += " AND agenda.id_especialidad = ?";
        params.push(id_especialidad);
      }
      if (fecha) {
        query += " AND DATE(agenda.fecha_inicio) = ?";
        params.push(fecha);
      }

      const [agendas] = await connection.query(query, params);
      const agendasFormatted = agendas.map((agenda) => ({
        ...agenda,
        fecha: isDate(agenda.fecha)
          ? format(agenda.fecha, "eeee d 'de' MMMM 'de' yyyy", { locale: es })
          : format(
              parse(agenda.fecha, "yyyy-MM-dd", new Date()),
              "eeee d 'de' MMMM 'de' yyyy",
              { locale: es }
            ),
        hora_inicio: format(
          new Date(`1970-01-01T${agenda.hora_inicio}`),
          "hh:mm a",
          { locale: es }
        ),
        hora_fin: format(new Date(`1970-01-01T${agenda.hora_fin}`), "hh:mm a", {
          locale: es,
        }),
      }));

      return agendasFormatted;
    } catch (err) {
      console.error("Error al obtener las agendas:", err);
      throw { status: 500, message: "Error al obtener las agendas" };
    } finally {
      connection.release();
    }
  },

  getAllMedicos: async () => {
    try {
      const [rows] = await db.query(
        "SELECT id, nombre, apellido FROM profesional"
      );
      return rows;
    } catch (err) {
      throw { status: 500, message: "Error al obtener médicos" };
    }
  },
  getAllEspecialidades: async () => {
    try {
      const [rows] = await db.query("SELECT id, nombre FROM especialidad");
      return rows;
    } catch (err) {
      throw { status: 500, message: "Error al obtener especialidades" };
    }
  },
};

export default mSecretaria;
