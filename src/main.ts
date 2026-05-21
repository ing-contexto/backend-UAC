import dotenv from "dotenv"
import server from "./server"

dotenv.config()

function main() {
  const port = server.get("port")

  server.listen(port, "127.0.0.1", function () {
    console.log("Server on", `http://127.0.0.1:${port}`)
  })
}

main()