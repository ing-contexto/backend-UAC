import MunicipalityRepository from "../../data/repository/municipality.repository";
import { Request, Response } from "express";

export default class MunicipalityController {
  private municipalityRepository: MunicipalityRepository;

  constructor(reposiroty: MunicipalityRepository) {
    this.municipalityRepository = reposiroty;
  }

  async getMunicipality(req: Request, res: Response) {
    try {
      const munId = parseInt(req.munId);
      const mun = await this.municipalityRepository.getMunicipality(munId);
      if (mun) {
        res.status(200).json(mun);
        return;
      }
      res.status(404).json({ message: "Municipio no encontrado" });
    } catch (error) {
      console.error("Error al obtener municipio por ID:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
