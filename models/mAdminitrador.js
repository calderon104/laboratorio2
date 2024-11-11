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
      return rows.map((row) => ({
        ...row,
        especialidades: row.especialidades ? row.especialidades.split(",") : [],
      }));
    } catch (err) {
      console.error("Error al obtener profesionales:", err);
      throw { status: 500, message: "Error al obtener profesionales" };
    }
  },

  getMedicoById: async (profesionalId) => {
    try {
      const [profesional] = await db.query(
        "SELECT * FROM profesional WHERE id = ?",
        [profesionalId]
      );
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
  
  bajaMedico: async (profesionalId) => {
    try {
      await db.query("UPDATE profesional SET activo = 0 WHERE id = ?", [profesionalId]);
    } catch (err) {
      console.error("Error al desactivar el médico:", err);
      throw { status: 500, message: "Error al desactivar el médico" };
    }
  },
  

  updateProfesional: async (profesionalId, profesionalData) => {
    try {
      await db.query("UPDATE profesional SET ? WHERE id = ?", [
        profesionalData,
        profesionalId,
      ]);
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

  create: async (profesionalData, especialidadData, agendaData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Crear el profesional
      const [profesionalResult] = await connection.query(
        "INSERT INTO profesional SET ?",
        [profesionalData]
      );
      const profesionalId = profesionalResult.insertId;

      // Asociar especialidad al profesional
      await connection.query(
        "INSERT INTO profesional_especialidad (id_profesional, id_especialidad, matricula) VALUES (?, ?, ?)",
        [
          profesionalId,
          especialidadData.id_especialidad,
          especialidadData.matricula,
        ]
      );

      // Asignar valores predeterminados si faltan
      const agendaDataWithDefaults = {
        id_profesional: profesionalId,
        id_especialidad: agendaData.id_especialidad,
        id_sucursal: agendaData.id_sucursal || 1, // Sucursal predeterminada
        fecha_inicio: agendaData.fecha_inicio || "2024-01-01", // Fecha inicial predeterminada
        fecha_fin: agendaData.fecha_fin || "2024-12-31", // Fecha final predeterminada
        clasificacion: agendaData.clasificacion || "General", // Clasificación predeterminada
        max_sobreturnos: agendaData.max_sobreturnos || 0, // Sobreturnos predeterminados
      };

      // Crear la agenda con valores predeterminados
      const [agendaResult] = await connection.query(
        "INSERT INTO agenda (id_profesional, id_especialidad, id_sucursal, fecha_inicio, fecha_fin, clasificacion, max_sobreturnos) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          agendaDataWithDefaults.id_profesional,
          agendaDataWithDefaults.id_especialidad,
          agendaDataWithDefaults.id_sucursal,
          agendaDataWithDefaults.fecha_inicio,
          agendaDataWithDefaults.fecha_fin,
          agendaDataWithDefaults.clasificacion,
          agendaDataWithDefaults.max_sobreturnos,
        ]
      );

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
      throw {
        status: 500,
        message: "Error al obtener especialidades disponibles",
      };
    }
  },

  // AGENDAS AQUI
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
      throw {
        status: 500,
        message: "Error al obtener agendas del profesional",
      };
    }
  },
  getAllAgendas: async () => {
    const connection = await db.getConnection();
    try {
      const [agendas] = await connection.query(`
            SELECT 
                agenda.id,
                profesional.nombre AS nombre_profesional,
                profesional.apellido AS apellido_profesional,
                especialidad.nombre AS especialidad
            FROM agenda
            JOIN profesional ON agenda.id_profesional = profesional.id
            JOIN especialidad ON agenda.id_especialidad = especialidad.id
        `);
      return agendas;
    } catch (err) {
      console.error("Error al obtener las agendas:", err);
      throw { status: 500, message: "Error al obtener las agendas" };
    } finally {
      connection.release();
    }
  },
  getAgendaById: async (agendaId) => {
    const connection = await db.getConnection();
    try {
      const [agendaDetails] = await connection.query(
        `
      SELECT 
        agenda.*,
        profesional.nombre AS nombre_profesional,
        profesional.apellido AS apellido_profesional,
        especialidad.nombre AS especialidad
      FROM agenda
      JOIN profesional ON agenda.id_profesional = profesional.id
      JOIN especialidad ON agenda.id_especialidad = especialidad.id
      WHERE agenda.id = ?
    `,
        [agendaId]
      );

      const [horarios] = await connection.query(
        `
      SELECT dia_semana, hora_inicio, hora_fin
      FROM horario_laboral
      WHERE id_agenda = ?
    `,
        [agendaId]
      );

      const diasLaborables = [...new Set(horarios.map((h) => h.dia_semana))];

      return {
        ...agendaDetails[0],
        dias_laborables: diasLaborables,
        horarios: horarios,
      };
    } catch (err) {
      console.error("Error al obtener los detalles de la agenda:", err);
      throw {
        status: 500,
        message: "Error al obtener los detalles de la agenda",
      };
    } finally {
      connection.release();
    }
  },
  updateAgenda: async (agendaId, updatedData, horarios) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Actualizar la tabla agenda
    await connection.query(
      "UPDATE agenda SET id_sucursal = ?, fecha_inicio = ?, fecha_fin = ?, clasificacion = ?, max_sobreturnos = ? WHERE id = ?",
      [
        updatedData.id_sucursal,
        updatedData.fecha_inicio,
        updatedData.fecha_fin,
        updatedData.clasificacion,
        updatedData.max_sobreturnos,
        agendaId,
      ]
    );

    // *** Nueva sección: Eliminar horarios anteriores ***
    await connection.query("DELETE FROM horario_laboral WHERE id_agenda = ?", [agendaId]);

    // Insertar los nuevos horarios laborales
    if (horarios.length > 0) {
      const insertQuery = "INSERT INTO horario_laboral (id_agenda, dia_semana, hora_inicio, hora_fin, duracion_turno) VALUES ?";
      const values = horarios.map(h => [agendaId, h.dia_semana, h.hora_inicio, h.hora_fin, h.duracion_turno]);
      await connection.query(insertQuery, [values]);
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    console.error("Error al actualizar la agenda:", err);
    throw { status: 500, message: "Error al actualizar la agenda" };
  } finally {
    connection.release();
  }
},

};

export default mAdministrador;
