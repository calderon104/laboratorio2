import db from "../config/db.js";

const mSecretaria = {
    create: async (paciente) => {
        try {
            const [result] = await db.query("INSERT INTO paciente SET ?", [paciente]);
            return result.insertId;
        } catch (err) {
            throw { status: 500, message: "Error al anadir la paciente" };
        }
    }
}

export default mSecretaria


