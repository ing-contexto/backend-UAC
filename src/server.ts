import express from "express"
import cors from "cors"
import municipalityRouter from "./modules/municipalities/application/route/municipality.route"
import userRouter from "./modules/users/application/route/user.route"
import authRouter from "./modules/auth/application/route/auth.router"
import eventSearcherRouter from "./modules/eventSearcher/application/route/eventSearcher.route"

declare global {
  namespace Express {
    interface Request {
      [param: string]: string
    }
  }
}

const server = express()

const allowedOrigins = [
  "https://uac-oaxaca.xyz",
  "https://www.uac-oaxaca.xyz",
  "http://localhost:5173",
  "http://localhost:8080"
]

server.set("trust proxy", true)
server.set("port", parseInt(process.env.PORT ?? "8080", 10))

server.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`Origen no permitido: ${origin}`))
    },
    credentials: true,
    optionsSuccessStatus: 200
  })
)

server.use(express.json())

server.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`, {
    ip: req.headers["cf-connecting-ip"] || req.ip,
    origin: req.headers.origin,
    userAgent: req.headers["user-agent"]
  })

  next()
})

server.get("/api/v1/ping", (req, res) => {
  res.json({
    ok: true,
    date: new Date().toISOString(),
    ip: req.headers["cf-connecting-ip"] || req.ip
  })
})

server.use(authRouter)
server.use(municipalityRouter)
server.use(userRouter)
server.use(eventSearcherRouter)

server.use((req, res) => {
  res.status(404).json({
    error: "NotFound",
    status: 404,
    path: req.originalUrl,
    method: req.method
  })
})

server.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("SERVER_ERROR", err)

  res.status(500).json({
    error: err.name,
    status: 500,
    message: err.message
  })
})

export default server