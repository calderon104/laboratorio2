//TODO

import mPacientes from "../models/mPaciente.js";
// import mTurnos from "../models/mTurnos.js";
// import mProfesionales from "../models/mProfesionales.js";

const cSecretaria = {
    homeSecretaria: (req, res) => {
        res.render("vSecretaria/secretaria");
    },
  // Mostrar el formulario para agregar un paciente
  getAddPacienteForm: (req, res) => {
    res.render("vSecretaria/sPacientes", { title: "Agregar Paciente" });
  },

  // Guardar un nuevo paciente
  addPaciente: async (req, res) => {
    try {
        const { nombre, apellido, dni, fecha_nacimiento, telefono, email, obra_social } = req.body;
        const paciente = { nombre, apellido, dni, fecha_nacimiento, telefono, email, obra_social };
        await mPacientes.create(paciente);
        res.render("vSecretaria/sPacientes", {newUser: true});
    } catch (err) {
        console.error("Error al crear paciente:", err);
        res.status(err.status || 500).json({ message: err.message || "Error al crear el paciente" });
    }
  },

  // Mostrar los profesionales para elegir turnos disponibles
  getProfesionales: async (req, res) => {
    try {
      const profesionales = await mProfesionales.findAll(); // Asume que mProfesionales tiene un método findAll()
      res.render("vSecretaria/turnos-disponibles", { title: "Ver Turnos", profesionales });
    } catch (error) {
      console.error("Error al obtener profesionales:", error);
      res.status(500).send("Error al obtener profesionales");
    }
  },

  // Mostrar los turnos disponibles para un profesional específico
//   getTurnos: async (req, res) => {
//     const profesionalId = req.params.profesionalId;
//     try {
//       const turnos = await mTurnos.findAvailableByProfessional(profesionalId); // Asume que mTurnos tiene este método
//       res.render("secretaria/listaTurnos", { title: "Turnos Disponibles", turnos });
//     } catch (error) {
//       console.error("Error al obtener turnos:", error);
//       res.status(500).send("Error al obtener turnos");
//     }
//   },

//   // Mostrar formulario para reservar un turno
//   getReservaForm: (req, res) => {
//     res.render("secretaria/reservaForm", { title: "Reservar Turno" });
//   },

//   // Reservar un turno
//   reserveTurno: async (req, res) => {
//     const { dni, profesionalId, horarioId } = req.body;
//     try {
//       // Verificar si el paciente existe por DNI
//       const paciente = await mPacientes.findByDni(dni);
//       if (!paciente) {
//         return res.status(404).send("Paciente no encontrado");
//       }

//       // Lógica para reservar el turno
//       await mTurnos.reserveTurno(horarioId, paciente.id, profesionalId);
//       res.redirect("/reservar-turno");
//     } catch (error) {
//       console.error("Error al reservar turno:", error);
//       res.status(500).send("Error al reservar turno");
//     }
//   },
};

export default cSecretaria;
