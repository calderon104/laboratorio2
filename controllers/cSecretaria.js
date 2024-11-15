import mSecretaria from "../models/mSecretaria.js"; // Cambié mPacientes a mSecretaria

const cSecretaria = {
  // Vista principal de secretaria
  homeSecretaria: (req, res) => {
    res.render("vSecretaria/secretaria");
  },

  getAddPacienteForm: (req, res) => {
    res.render("vSecretaria/sPacientes", { title: "Agregar Paciente" });
  },

  addPaciente: async (req, res) => {
    try {
      const { nombre, apellido, dni, fecha_nacimiento, telefono, email, obra_social } = req.body;
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

      await mSecretaria.create(paciente); 
      res.redirect("/secretaria/listar-paciente"); 
    } catch (err) {
      console.error("Error al crear paciente:", err);
      res.status(500).render("vSecretaria/agregar-paciente", {
        title: "Registrar Paciente",
        error: "Hubo un problema al registrar el paciente. Inténtalo nuevamente.",
      });
    }
  },

  getAllAgendas: async (req, res) => {
    try {
      const { id_medico, id_especialidad, fecha } = req.query;
  

      const agendas = await mSecretaria.getAllAgendas({
        id_medico,
        id_especialidad,
        fecha,
      });

      const medicos = await mSecretaria.getAllMedicos();
      const especialidades = await mSecretaria.getAllEspecialidades();
  
      res.render("vSecretaria/consultar-agenda", {
        title: "Consultar Agendas",
        agendas,
        medicos,
        especialidades,
        selectedMedico: id_medico || '',
        selectedEspecialidad: id_especialidad || '',
        selectedFecha: fecha || '',
      });
    } catch (err) {
      console.error("Error al obtener agendas:", err);
      res.status(500).render("vSecretaria/consultar-agenda", {
        title: "Consultar Agendas",
        error: "No se pudieron obtener las agendas. Inténtalo de nuevo.",
      });
    }
  },

  listPacientes: async (req, res) => {
    try {
      const pacientes = await mSecretaria.getAllPacientes(); 
      res.render("vSecretaria/lista-pacientes", {
        title: "Lista de Pacientes",
        pacientes,
      });
    } catch (err) {
      console.error("Error al listar pacientes:", err);
      res.status(500).render("vSecretaria/lista-pacientes", {
        title: "Lista de Pacientes",
        error: "No se pudieron listar los pacientes.",
      });
    }
  },
};

export default cSecretaria;
