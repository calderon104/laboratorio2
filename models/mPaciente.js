import db from "../config/db.js";

const mPacientes = {
  getAll: async () => {
    try {
      const [results] = await db.query("SELECT * FROM paciente");
      return results;
    } catch (err) {
      throw { status: 500, message: "Error al traer los pacientes" };
    }
  },

  getOne: async (id) => {
    try {
      const [results] = await db.query("SELECT * FROM paciente WHERE id = ?", [
        id,
      ]);
      if (results.length === 0) {
        throw { status: 404, message: "Paciente no encontrado" };
      }
      return results[0];
    } catch (err) {
      throw {
        status: err.status || 500,
        message: err.message || "Error al obtener el paciente",
      };
    }
  },

  getPacienteByDNI: async (dni) => {
    try {
      const [results] = await db.query("SELECT * FROM paciente WHERE dni = ?", [
        dni,
      ]);
      if (results.length === 0) {
        throw { status: 404, message: "Paciente no encontrado" };
      }
      return results[0];
    } catch (err) {
      throw { status: 500, message: "Error al obtener paciente por DNI" };
    }
  },

  create: async (paciente) => {
    try {
      const [result] = await db.query("INSERT INTO paciente SET ?", [paciente]);
      return result.insertId;
    } catch (err) {
      throw { status: 500, message: "Error al añadir al paciente" };
    }
  },

  update: async (id, paciente) => {
    try {
      const [result] = await db.query("UPDATE paciente SET ? WHERE id = ?", [
        paciente,
        id,
      ]);
      if (result.affectedRows === 0) {
        throw { status: 404, message: "Paciente no encontrado" };
      }
      return true;
    } catch (err) {
      throw {
        status: err.status || 500,
        message: err.message || "Error al actualizar el paciente",
      };
    }
  },

  updatePaciente: async (id, data) => {
    const {
      nombre,
      apellido,
      fecha_nacimiento,
      telefono,
      email,
      obra_social,
      dni_copia,
    } = data;
    try {
      const [result] = await db.query(
        `UPDATE paciente 
         SET nombre = ?, apellido = ?, fecha_nacimiento = ?, telefono = ?, email = ?, obra_social = ?, dni_copia = ?
         WHERE id = ?`,
        [
          nombre,
          apellido,
          fecha_nacimiento,
          telefono,
          email,
          obra_social,
          dni_copia,
          id,
        ]
      );
      if (result.affectedRows === 0) {
        throw { status: 404, message: "Paciente no encontrado" };
      }
      return true;
    } catch (err) {
      throw { status: 500, message: "Error al actualizar el paciente" };
    }
  },

  delete: async (id) => {
    try {
      const [result] = await db.query("DELETE FROM paciente WHERE id = ?", [
        id,
      ]);
      if (result.affectedRows === 0) {
        throw { status: 404, message: "Paciente no encontrado" };
      }
      return true;
    } catch (err) {
      throw { status: 500, message: "Error al eliminar el paciente" };
    }
  },
obtenerPacientePorDni: async (dni) => {
  try {
    const [result] = await db.query("SELECT * FROM paciente WHERE dni = ?", [dni]);
    return result[0] || null;
  } catch (err) {
    console.error("Error al buscar paciente por DNI:", err);
    throw { status: 500, message: "Error al buscar paciente por DNI" };
  }
},

  verTurnosDisponibles: async (id) => {
    try {
      const [result] = await db.query(`
        SELECT t.id, t.fecha, t.hora_inicio, t.hora_fin, p.nombre AS nombre_profesional, e.nombre AS nombre_especialidad
        FROM turno t
        JOIN agenda a ON t.id_agenda = a.id
        JOIN profesional p ON a.id_profesional = p.id
        JOIN especialidad e ON a.id_especialidad = e.id
        WHERE t.id_paciente IS NULL AND t.estado = 'disponible'
        ORDER BY t.fecha, t.hora_inicio;
      `);
      return result;
    } catch (err) {
      throw { status: 500, message: "Error al obtener los turnos disponibles" };
    }
  },
  asignarTurnoAPaciente: async (id_turno, id_paciente) => {
    const [result] = await db.query(
      "UPDATE turno set id_paciente = ?,estado = 'reservado' WHERE id = ?",
      [id_paciente, id_turno]
    );
  },
  verTurnosDisponiblesPorFecha: async (idMedico, fecha) => {
    try {
      const [result] = await db.query(`
        SELECT t.id, t.fecha, t.hora_inicio, t.hora_fin, t.estado
        FROM turno t
        JOIN agenda a ON t.id_agenda = a.id
        WHERE a.id_profesional = ? 
          AND t.fecha = ? 
          AND (t.estado = 'disponible' OR t.estado = 'reservado')
        ORDER BY t.hora_inicio
      `, [idMedico, fecha]);
      
      return result;
    } catch (err) {
      console.error('Error en verTurnosDisponiblesPorFecha:', err);
      throw { status: 500, message: "Error al obtener los turnos disponibles" };
    }
  },
  verTurnosDisponiblesPorMes: async (idMedico, fechaInicio, fechaFin) => {
    try {
      const [result] = await db.query(`
        SELECT t.id, t.fecha, t.hora_inicio, t.hora_fin, t.estado
        FROM turno t
        JOIN agenda a ON t.id_agenda = a.id
        WHERE a.id_profesional = ?
          AND t.fecha BETWEEN ? AND ?
          AND t.estado = 'disponible'
        ORDER BY t.fecha, t.hora_inicio
      `, [idMedico, fechaInicio, fechaFin]);
  
      return result;
    } catch (err) {
      console.error('Error en verTurnosDisponiblesPorMes:', err);
      throw { status: 500, message: "Error al obtener los turnos disponibles para el mes" };
    }
  },
  
  obtenerDiasAtencionMedico: async (idMedico) => {
    try {
      const [result] = await db.query(`
        SELECT DISTINCT DAYOFWEEK(a.fecha_inicio) as dia_semana
        FROM agenda a
        JOIN horario_laboral hl ON a.id = hl.id_agenda
        WHERE a.id_profesional = ?
        AND a.fecha_inicio >= CURDATE()
        ORDER BY dia_semana
      `, [idMedico]);
      
      return result.map(row => row.dia_semana);
    } catch (err) {
      console.error('Error en obtenerDiasAtencionMedico:', err);
      throw { status: 500, message: "Error al obtener los días de atención del médico" };
    }
  },

};

export default mPacientes;
