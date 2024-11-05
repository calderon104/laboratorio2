import db from "../config/db.js";

const mAdministrador = {
  getAllProfesionales: async () => {
    try {
      const [rows] = await db.query(
        `SELECT p.id, p.nombre, p.apellido, p.dni, GROUP_CONCAT(e.nombre) AS especialidades
         FROM profesional p
         LEFT JOIN profesional_especialidad pe ON p.id = pe.id_profesional
         LEFT JOIN especialidad e ON pe.id_especialidad = e.id
         WHERE p.activo = TRUE
         GROUP BY p.id`
      );
      return rows.map(row => ({
        ...row,
        especialidades: row.especialidades ? row.especialidades.split(',') : []
      }));
    } catch (err) {
      console.error("Error al obtener profesionales:", err);
      throw { status: 500, message: "Error al obtener profesionales" };
    }
  },

  getMedicoById: async (profesionalId) => {
    try {
      const [profesional] = await db.query("SELECT * FROM profesional WHERE id = ?", [profesionalId]);
      const [especialidades] = await db.query(
        `SELECT e.id, e.nombre, pe.matricula
         FROM especialidad e
         JOIN profesional_especialidad pe ON e.id = pe.id_especialidad
         WHERE pe.id_profesional = ?`,
        [profesionalId]
      );
      return { ...profesional[0], especialidades };
    } catch (err) {
      console.error("Error al obtener profesional:", err);
      throw { status: 500, message: "Error al obtener el profesional" };
    }
  },

  updateProfesional: async (profesionalId, profesionalData) => {
    try {
      await db.query("UPDATE profesional SET ? WHERE id = ?", [profesionalData, profesionalId]);
    } catch (err) {
      console.error("Error al actualizar profesional:", err);
      throw { status: 500, message: "Error al actualizar el profesional" };
    }
  },

  addEspecialidad: async (profesionalId, especialidadId, matricula) => {
    try {
      await db.query(
        "INSERT INTO profesional_especialidad (id_profesional, id_especialidad, matricula) VALUES (?, ?, ?)",
        [profesionalId, especialidadId, matricula]
      );
    } catch (err) {
      console.error("Error al agregar especialidad:", err);
      throw { status: 500, message: "Error al agregar especialidad" };
    }
  },

  removeEspecialidad: async (profesionalId, especialidadId) => {
    try {
      await db.query(
        "DELETE FROM profesional_especialidad WHERE id_profesional = ? AND id_especialidad = ?",
        [profesionalId, especialidadId]
      );
    } catch (err) {
      console.error("Error al eliminar especialidad:", err);
      throw { status: 500, message: "Error al eliminar especialidad" };
    }
  },

  create: async (profesionalData, especialidades, agendas) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      profesionalData.activo = profesionalData.activo ?? true;
      const [profesionalResult] = await connection.query(
        "INSERT INTO profesional SET ?",
        [profesionalData]
      );
      const profesionalId = profesionalResult.insertId;

      for (const esp of especialidades) {
        await connection.query(
          "INSERT INTO profesional_especialidad (id_profesional, id_especialidad, matricula) VALUES (?, ?, ?)",
          [profesionalId, esp.id_especialidad, esp.matricula]
        );
      }

      for (const agenda of agendas) {
        const [agendaResult] = await connection.query(
          "INSERT INTO agenda (id_profesional, id_especialidad, id_sucursal, fecha_inicio, fecha_fin, clasificacion, max_sobreturnos) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [profesionalId, agenda.id_especialidad, agenda.id_sucursal, agenda.fecha_inicio, agenda.fecha_fin, agenda.clasificacion, agenda.max_sobreturnos]
        );
        const agendaId = agendaResult.insertId;

        for (const horario of agenda.horarios) {
          await connection.query(
            "INSERT INTO horario_laboral (id_agenda, dia_semana, hora_inicio, hora_fin, duracion_turno) VALUES (?, ?, ?, ?, ?)",
            [agendaId, horario.dia_semana, horario.hora_inicio, horario.hora_fin, horario.duracion_turno]
          );
        }
      }

      await connection.commit();
      return profesionalId;
    } catch (err) {
      await connection.rollback();
      console.error("Error al crear el profesional:", err);
      throw { status: 500, message: "Error al añadir al profesional" };
    } finally {
      connection.release();
    }
  },

  getSucursales: async () => {
    try {
      const [results] = await db.query("SELECT * FROM sucursal");
      return results;
    } catch (err) {
      console.error("Error al obtener sucursales:", err);
      throw { status: 500, message: "Error al obtener las sucursales" };
    }
  },

  getEspecialidades: async () => {
    try {
      const [results] = await db.query("SELECT * FROM especialidad");
      return results;
    } catch (err) {
      console.error("Error al obtener especialidades:", err);
      throw { status: 500, message: "Error al obtener especialidades" };
    }
  },

  getEspecialidadesDisponibles: async (profesionalId) => {
    try {
      const [results] = await db.query(
        `SELECT e.id, e.nombre 
         FROM especialidad e
         LEFT JOIN profesional_especialidad pe ON e.id = pe.id_especialidad AND pe.id_profesional = ?
         WHERE pe.id_profesional IS NULL`,
        [profesionalId]
      );
      return results;
    } catch (err) {
      console.error("Error al obtener especialidades disponibles:", err);
      throw { status: 500, message: "Error al obtener especialidades disponibles" };
    }
  },

  getTurnosDisponibles: async (agendaId, fecha) => {
    try {
      const [results] = await db.query(
        `SELECT t.id, t.hora_inicio, t.hora_fin
         FROM turno t
         JOIN agenda a ON t.id_agenda = a.id
         WHERE a.id = ? AND t.fecha = ? AND t.estado = 'disponible'
         ORDER BY t.hora_inicio`,
        [agendaId, fecha]
      );
      return results;
    } catch (err) {
      console.error("Error al obtener turnos disponibles:", err);
      throw { status: 500, message: "Error al obtener turnos disponibles" };
    }
  },

  getAgendasProfesional: async (profesionalId) => {
    try {
      const [results] = await db.query(
        `SELECT a.*, e.nombre AS especialidad, s.nombre AS sucursal
         FROM agenda a
         JOIN especialidad e ON a.id_especialidad = e.id
         JOIN sucursal s ON a.id_sucursal = s.id
         WHERE a.id_profesional = ?`,
        [profesionalId]
      );
      return results;
    } catch (err) {
      console.error("Error al obtener agendas del profesional:", err);
      throw { status: 500, message: "Error al obtener agendas del profesional" };
    }
  },

  getHorariosLaborales: async (agendaId) => {
    try {
      const [results] = await db.query(
        "SELECT * FROM horario_laboral WHERE id_agenda = ?",
        [agendaId]
      );
      return results;
    } catch (err) {
      console.error("Error al obtener horarios laborales:", err);
      throw { status: 500, message: "Error al obtener horarios laborales" };
    }
  },
};

export default mAdministrador;