import { NextFunction, Request, Response } from "express";
import { authToken } from "../../../core/token/toke";

// declare global {
//   namespace Express {
//     interface Request {
//       userId: string;
//     }
//   }
// }

export class AuthMiddlewareController {
  private token: authToken;
  constructor(token: authToken) {
    this.token = token;
  }

  async checkToken(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(401).json({ error: "Authorization needed" });
      return;
    }

    const [scheme, value] = auth.split(" ");
    if (scheme !== "Bearer" || !value) {
      res.status(400).json({ error: "Invalid Token format" });
      return;
    }

    const payload = this.token.verifyAndGetPayload(value);
    if (!payload) {
      res.status(403).json({ error: "Invalid access token" });
      return;
    }

    req.userId = String(payload.sub);
    next();
  }
}
