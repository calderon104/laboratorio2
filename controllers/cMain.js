const cMain = {
    renderHome: (req, res) => {
        res.render("index", { title: "Página Principal" });
    },
};

export default cMain;
