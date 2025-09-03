import express from "express";
import cors from "cors";
import municipalityRouter from "./modules/municipalities/application/route/municipality.route";
import userRouter from "./modules/users/application/route/user.route";
import authRouter from "./modules/auth/application/route/auth.router";

declare global {
  namespace Express {
    interface Request {
      [param: string]: string;
    }
  }
}

const server = express();
server.set("port", parseInt(process.env.PORT || "8080"));

server.use(
  cors({
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  })
);
server.use(express.json());

server.use(authRouter);
server.use(municipalityRouter);
server.use(userRouter);

export default server;
