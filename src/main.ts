import dotenv from "dotenv";
import server from "./server";

dotenv.config();

function main() {
  const port = server.get("port");

  server.listen(port, "0.0.0.0", function () {});
  console.log("Server on port", port);
}

main();
