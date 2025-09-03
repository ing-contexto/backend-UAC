import { Router } from "express";
import AuthController from "../controller/auth.controller";
import { AuthRepository } from "../../data/repository/auth.repository";
import AuthDatasource from "../../data/datasource/auth.datasource";
import { authToken } from "../../../core/token/toke";

const authRouter: Router = Router();

const token = new authToken();
const datasource = new AuthDatasource();
const repository = new AuthRepository(datasource);

const authController = new AuthController(repository, token);

authRouter.post("/api/v1/login", async (req, res) => {
  authController.logIn(req, res);
});

export default authRouter;
