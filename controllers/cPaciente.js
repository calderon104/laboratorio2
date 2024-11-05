import mPacientes from "../models/mPaciente.js";

const cPacientes = {
    getForm: (req, res) => {
        res.render("pacientes", { title: "Crear Paciente" });
    },
    create: async (req, res) => {
        try {
            const { nombre, apellido, dni, fecha_nacimiento, telefono, email, obra_social } = req.body;
            const paciente = { nombre, apellido, dni, fecha_nacimiento, telefono, email, obra_social };
            await mPacientes.create(paciente);
            res.render("pacientes", {newPaciente: true});
        } catch (err) {
            console.error("Error al crear paciente:", err);
            res.status(err.status || 500).json({ message: err.message || "Error al crear el paciente" });
        }
    },
    // Puedes agregar más métodos aquí para otras operaciones CRUD
};

export default cPacientes;