import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AuthRepository } from "../../data/repository/auth.repository";
import { userCredentials } from "../../model/userCredentials";
import { authToken } from "../../../core/token/toke";

export default class AuthController {
  private authRepository: AuthRepository;
  private token: authToken;

  constructor(repository: AuthRepository, token: authToken) {
    this.authRepository = repository;
    this.token = token;
  }

  async logIn(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const match: userCredentials = {
      email: email,
      password: password,
    };

    try {
      const user = await this.authRepository.sigIn(match);
      if (user == null) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      const validatePassword = await bcrypt.compare(password, user.password);
      if (!validatePassword) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const accessToken = this.token.makeAccessToken(user.id as number, user.correo);

      res.status(200).json({ accessToken });
    } catch (error) {
      res.status(500).json({ error: "Error de servidor" });
    }
  }
}
