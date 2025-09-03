import { Request, Response } from "express";
import UserRepository from "../../data/repository/user.repository";

export default class UserController {
    private UserRepository: UserRepository;

    constructor(reposiroty: UserRepository) {
        this.UserRepository = reposiroty;
    }

    async getRoles(_req: Request, res: Response) {
        try {
            const users = await this.UserRepository.getRoles();
            res.status(200).json(users);
        } catch (error) {
            console.error("Error al obtener roles:", error);
            res.status(500).json({ message: "Error interno del servidor " + error });
        }
    }

    async getCurrentUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.userId);
            const user = await this.UserRepository.getCurrentUser(userId);
            if (user) {
                res.status(200).json(user);
                return;
            }
            res.status(404).json({ message: "Usuario no encontrado" });
        } catch (error) {
            console.error("Error al obtener usuario por ID:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const result = await this.UserRepository.createUser(req.body);
            if (result) {
                res.status(201).json({ mesagge: "Usuario creado correctamente" });
                return;
            }
            res.status(400).json({ mesagge: "Error en la creación del usuario" });
        } catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const result = await this.UserRepository.updateUser(userId, req.body);

            if (result) {
                res.status(200).json(result);
                return;
            }
            res.status(400).json({ message: "Usuario no existente" });
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const result = await this.UserRepository.deleteUser(userId);

            if (result) {
                res.status(200).json({ message: "Usuario eliminado correctamente" });
                return;
            }
            res.status(404).json({ message: "Usuario no encontrado" });
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
}