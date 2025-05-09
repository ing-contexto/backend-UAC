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
      if (isNaN(munId) || munId < 0) {
        res.status(400).json("Municipio inválido");
        return;
      }
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

      if (!Array.isArray(munId) || !munId.every(id => id >= 0)) {
        res.status(400).json({ message: "Lista de municipios inválida" });
        return;
      }

      const mun = await this.municipalityRepository.getMunicipalities(munId);
      if (mun != null) {
        res.status(200).json(mun);
        return;
      }

      res.status(404).json({ message: "Municipios no encontrados" });
    } catch (error) {
      console.error("Error al obtener municipios:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }


  async addNeighborings(req: Request, res: Response) {
    try {
      const munId = Number(req.params.munId);
      const neighbors: number[] = req.body.neighbors
      const mun = await this.municipalityRepository.addNeighborings(munId, neighbors);
      if (mun) {
        res.status(200).json({ message: "Municipios colindantes actualizados" });
        return;
      }
      res.status(404).json({ message: "Error al agregar el municipio" });
    } catch (error) {
      console.error("Error al obtener municipio por ID:", error);
      res.status(500).json({ message: "Error al agregar el municipio" });
    }
  }

  async addRecentEvent(req: Request, res: Response) {
    try {
      const munId: number[] = req.body.munId;
      const event: RecentEvent = req.body.event
      const mun = await this.municipalityRepository.addRecentEvent(event, munId);
      if (mun) {
        res.status(200).json({ message: "Evento reciente creado" });
        return;
      }
      res.status(404).json({ message: "Error al agregar el municipio" });
    } catch (error) {
      console.error("Error al obtener municipio por ID:", error);
      res.status(500).json({ message: "Error al agregar el municipio" });
    }
  }

  async getRecentEvents(req: Request, res: Response) {
    try {
      const munId: number[] = req.body.munId;

      if (!Array.isArray(munId) || !munId.every(id => id >= 0)) {
        res.status(400).json({ message: "Lista de eventos inválida" });
        return;
      }

      const mun = await this.municipalityRepository.getRecentEvents(munId);
      if (mun != null) {
        res.status(200).json(mun);
        return;
      }

      res.status(404).json({ message: "Eventos no encontrados" });
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async deleteRecentEvent(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.eventId);
      const mun = await this.municipalityRepository.deleteRecentEvent(eventId);
      if (mun) {
        res.status(200).json({ message: "Evento eliminado" });
        return;
      }
      res.status(404).json({ message: "Error al eliminar el evento" });
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async updateRecentEvent(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.eventId);
      const event: RecentEvent = req.body.event
      const mun = await this.municipalityRepository.updateRecentEvent(eventId, event);
      if (mun) {
        res.status(200).json({ message: "Evento actualizado" });
        return;
      }
      res.status(404).json({ message: "Error al actualizar el evento" });
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
