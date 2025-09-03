import { Router } from "express";
import UserController from "../controller/user.controller";
import { AuthMiddlewareController } from "../../../auth/application/controller/auth.middleware.controller";
import UserRepository from "../../data/repository/user.repository";
import UserDatasource from "../../data/datasource/user.datasource";
import { authToken } from "../../../core/token/toke";

const userRouter: Router = Router();
const datasource = new UserDatasource();
const repository = new UserRepository(datasource);
const token = new authToken();

const userController = new UserController(repository);
const authMiddlewareController = new AuthMiddlewareController(token);

userRouter.get(
    "/api/v1/get-roles",
    async (req, res, next) => {
        authMiddlewareController.checkToken(req, res, next);
    },
    (req, res) => {
        userController.getRoles(req, res);
    }
);

userRouter.get(
    "/api/v1/get-current-user",
    async (req, res, next) => {
        authMiddlewareController.checkToken(req, res, next);
    },
    (req, res) => {
        userController.getCurrentUser(req, res);
    }
);

userRouter.post(
    "/api/v1/create-user",

    (req, res) => {
        console.log("si")
        userController.createUser(req, res);
    }
);

userRouter.put(
    "/api/v1/update/:id",
    async (req, res, next) => {
        authMiddlewareController.checkToken(req, res, next);
    },
    (req, res) => {
        userController.updateUser(req, res);
    }
);

userRouter.delete(
    "/api/v1/delete/:id",
    async (req, res, next) => {
        authMiddlewareController.checkToken(req, res, next);
    },
    (req, res) => {
        userController.deleteUser(req, res);
    }
);

export default userRouter;