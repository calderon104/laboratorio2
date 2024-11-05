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
            const [results] = await db.query("SELECT * FROM paciente WHERE id = ?", [id]);
            if (results.length === 0) {
                throw { status: 404, message: "Paciente no encontrado" };
            }
            return results[0];
        } catch (err) {
            throw { status: err.status || 500, message: err.message || "Error al obtener el paciente" };
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
            const [result] = await db.query("UPDATE paciente SET ? WHERE id = ?", [paciente, id]);
            if (result.affectedRows === 0) {
                throw { status: 404, message: "Paciente no encontrado" };
            }
            return true;
        } catch (err) {
            throw { status: err.status || 500, message: err.message || "Error al actualizar el paciente" };
        }
    },
    delete: async (id) => {
        try {
            const [result] = await db.query("DELETE FROM paciente WHERE id = ?", [id]);
            if (result.affectedRows === 0) {
                throw { status: 404, message: "Paciente no encontrado" };
            }
            return true;
        } catch (err) {
            throw { status: err.status || 500, message: err.message || "Error al eliminar el paciente" };
        }
    }
};

export default mPacientes;