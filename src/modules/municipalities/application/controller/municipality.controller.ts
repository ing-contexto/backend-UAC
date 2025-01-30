import MunicipalityRepository from "../../data/repository/municipality.repository";
import { Request, Response } from "express";

export default class MunicipalityController {
  private municipalityRepository: MunicipalityRepository;

  constructor(reposiroty: MunicipalityRepository) {
    this.municipalityRepository = reposiroty;
  }

  async getMunicipality(req: Request, res: Response) {
    try {
      const munId = parseInt(req.body.munId);
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
  async getMunicipalities(req: Request, res: Response) {
    try {
      const munId: number[] = req.body.munId;
      const mun = await this.municipalityRepository.getMunicipalities(munId);
      if (mun != null) {
        res.status(200).json(mun);
        return;
      }
      res.status(404).json({ message: "Municipios no encontrado" });
    } catch (error) {
      console.error("Error al obtener municipio por ID:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
