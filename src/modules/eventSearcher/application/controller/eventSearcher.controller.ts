import EventSearcherRepository from "../../data/repository/eventSearcher.repository";

import { Request, Response } from "express";

export default class EventSearcherController {
    private eventSearcherRepository: EventSearcherRepository;

    constructor(repository: EventSearcherRepository) {
        this.eventSearcherRepository = repository;
    }

    async searchRecentEvents(req: Request, res: Response) {
        try {
            const keyword = String(req.query.keyword);
            const events = await this.eventSearcherRepository.searchRecentEvents(keyword)
            if (events != null) {
                res.status(200).json(events);
                return;
            }

            res.status(404).json({ message: "Eventos no encontrados" });
        } catch (error) {
            console.error("Error en la búsqueda:", error);
            res.status(500).json({ message: "Error en la búsqueda" });
        }
    }
}