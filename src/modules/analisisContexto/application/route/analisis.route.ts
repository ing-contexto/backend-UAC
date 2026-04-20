import { Router } from "express";
import AnalisisDatasource from "../../data/datasource/analisis.datasource";
import AnalisisController from "../controller/analisis.controller";

const analisisRouter: Router = Router();

const analisisDatasource = new AnalisisDatasource()
const analisisController = new AnalisisController(analisisDatasource)

analisisRouter.get("/api/analisis/openia", async (req, res) => {
    analisisController.getOpenIAAnalisys(req, res)
})


export default analisisRouter
