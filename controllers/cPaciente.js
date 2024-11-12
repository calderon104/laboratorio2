import mPacientes from "../models/mPaciente.js";
import mAdministrador from "../models/mAdminitrador.js";

const cPacientes = {
  // Formulario principal para buscar por DNI
  getFormMain: (req, res) => {
    res.render("vPaciente/pacienteMain", { title: "Bienvenido" });
  },

  // Formulario de registro de pacientes
  getForm: (req, res) => {
    res.render("vPaciente/paciente", { title: "Registrar Paciente" });
  },

  // Crear nuevo paciente
  create: async (req, res) => {
    try {
      const { nombre, apellido, dni, fecha_nacimiento, telefono, email, obra_social } = req.body;
      const dni_copia = req.file ? req.file.filename : null; // Obtener el nombre del archivo subido

      const paciente = {
        nombre,
        apellido,
        dni,
        fecha_nacimiento,
        telefono,
        email,
        obra_social,
        dni_copia, // Guardar el nombre del archivo en la base de datos
      };

      // Verificar si el paciente ya existe por DNI antes de crearlo
      // const existingPaciente = await mPacientes.getPacienteByDNI(dni);
      // if (existingPaciente) {
      //   return res.status(400).render("vPaciente/paciente", {
      //     title: "Registrar Paciente",
      //     error: "El paciente ya está registrado con este DNI.",
      //   });
      // }

      await mPacientes.create(paciente);
      res.redirect("/pacientesMain");
    } catch (err) {
      console.error("Error al crear paciente:", err);
      res.status(500).render("vPaciente/paciente", {
        title: "Registrar Paciente",
        error: "Hubo un problema al registrar el paciente. Inténtalo nuevamente.",
      });
    }
  },

  // Buscar paciente por DNI
  buscarPorDNI: async (req, res) => {
    try {
      const { dni } = req.body;

      // Buscar el paciente por DNI
      const paciente = await mPacientes.getPacienteByDNI(dni);
      if (!paciente) {
        return res.status(404).render("vPaciente/pacienteMain", {
          title: "Buscar Paciente",
          error: "Paciente no encontrado",
        });
      }
      // Obtener la lista de médicos con sus especialidades
      const medicos = await mAdministrador.getAllProfesionales();
      // Renderizar la vista con la información del paciente y los médicos
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

  // Subir fotocopia del DNI para un paciente existente
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
};

export default cPacientes;
