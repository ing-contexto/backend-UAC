import { Router } from "express";
import MunicipalityDatasource from "../../data/datasource/municipality.datasource";
import MunicipalityRepository from "../../data/repository/municipality.repository";
import MunicipalityController from "../controller/municipality.controller";

const municipalityRouter: Router = Router();

const datasource = new MunicipalityDatasource();
const repository = new MunicipalityRepository(datasource);

const municipalityController = new MunicipalityController(repository);

municipalityRouter.post("/api/v1/municipalities/get-mun", async (req, res) => {
  console.log("si");
  municipalityController.getMunicipality(req, res);
});

export default municipalityRouter;
