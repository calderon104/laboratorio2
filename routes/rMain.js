import { Router } from "express";
import cMain from "../controllers/cMain.js";

const routes = Router();

routes.get("/", cMain.renderHome);

export default routes;
