import { Router } from "express";
import EventSearcherDatasource from "../../data/datasource/eventSearcher.datasource";
import EventSearcherRepository from "../../data/repository/eventSearcher.repository";
import RecentEventController from "../controller/eventSearcher.controller"

const eventSearcherRouter: Router = Router()
const datasource = new EventSearcherDatasource();
const repository = new EventSearcherRepository(datasource);

const recentEventController = new RecentEventController(repository)

eventSearcherRouter.get("/api/v1/events/search", async (req, res) => {
    recentEventController.searchRecentEvents(req, res);
})

export default eventSearcherRouter;