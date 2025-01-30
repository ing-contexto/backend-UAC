import express, { Request, Response } from "express";
const app = express();

const PORT = 8080;

app.get("/", (request: Request, response: Response) => {
  response.status(200).send("Hello Worsadfasdld");
});

app
  .listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
  })
  .on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
  });
