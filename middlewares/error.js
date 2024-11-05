const error = {
    e401: (req, res,err) => {
      res.status(401).render("error", {
        title: "Error 401 Authorization Required",
        message: err.message,
      });
    },
    
    e403: (req, res, err) => {
      res.status(403).render("error", {
        title: "Error 403 Forbidden Access",
        message: err.message,
      });
    },
    
    e404: (req, res) => {
      res.status(404).render("error", {
        title: "Error 404",
        message: "El recurso que estas buscando no existe 😢",
      });
    },
    e500: (req, res, err) => {
      res.status(500).render("error", {
        title: "Error 500 Internal Server",
        message: err.message,
      });
    },
  };
  
  export default error;
  