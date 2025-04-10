import { Router } from "express";
import MunicipalityDatasource from "../../data/datasource/municipality.datasource";
import MunicipalityRepository from "../../data/repository/municipality.repository";
import MunicipalityController from "../controller/municipality.controller";

const municipalityRouter: Router = Router();

const datasource = new MunicipalityDatasource();
const repository = new MunicipalityRepository(datasource);

const municipalityController = new MunicipalityController(repository);

municipalityRouter.post("/api/v1/municipalities/get-mun", async (req, res) => {
  municipalityController.getMunicipality(req, res);
});

municipalityRouter.post(
  "/api/v1/municipalities/get-muninipalities",
  async (req, res) => {
    municipalityController.getMunicipalities(req, res);
  }
);

municipalityRouter.post(
  "/api/v1/municipalities/add-neighbors/:munId",
  async (req, res) => {
    municipalityController.addNeighborings(req, res);
  }
);

municipalityRouter.post("/api/v1/municipalities/add-event", async (req, res) => {
  municipalityController.addRecentEvent(req, res);
})

municipalityRouter.post("/api/v1/municipalities/get-events", async (req, res) => {
  municipalityController.getRecentEvents(req, res);
})

municipalityRouter.delete("/api/v1/municipalities/delete-event/:eventId", async (req, res) => {
  municipalityController.deleteRecentEvent(req, res);
})

export default municipalityRouter;
