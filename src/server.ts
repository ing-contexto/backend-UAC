import express from "express";
import cors from "cors";
import municipalityRouter from "./modules/municipalities/application/route/municipality.route";

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

server.use(municipalityRouter);

export default server;
