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

export default municipalityRouter;
