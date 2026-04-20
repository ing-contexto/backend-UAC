import { Request, Response } from "express";
import AnalisisDatasource from "../../data/datasource/analisis.datasource";

export default class AnalisisController {
    private analisisDatasource: AnalisisDatasource;

    constructor(analisisDatasource: AnalisisDatasource) {
        this.analisisDatasource = analisisDatasource;
    }

    async getOpenIAAnalisys(req: Request, res: Response) {
        try {
            const resp = await this.analisisDatasource.getRespuesta()
            if (resp) {
                res.status(200).json({ analisis: resp })
            }
            res.status(404).json({ message: "Error al realizar el análisis" });
        } catch (error) {
            console.error("Error al obtener municipio por ID:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }

}