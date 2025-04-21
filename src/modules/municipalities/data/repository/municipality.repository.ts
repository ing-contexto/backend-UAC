import Municipality from "../../domain/model/municipality";
import MunicipalityDatasource from "../datasource/municipality.datasource";

export default class MunicipalityRepository {
  private municipalityDatasource: MunicipalityDatasource;

  constructor(datasource: MunicipalityDatasource) {
    this.municipalityDatasource = datasource;
  }

  async getMunicipality(munId: number): Promise<Municipality | null> {
    return this.municipalityDatasource.getMunicipality(munId);
  }

  async getMunicipalities(munId: number[]): Promise<Municipality[]> {
    return this.municipalityDatasource.getMunicipalities(munId);
  }

  async addNeighborings(munId: number, neighbors: number[]): Promise<Boolean> {
    return this.municipalityDatasource.addNeighborings(munId, neighbors)
  }

  async addRecentEvent(event: RecentEvent, munId: number[]): Promise<Boolean> {
    return this.municipalityDatasource.addRecentEvent(event, munId)
  }

  async getRecentEvents(munId: number[]): Promise<RecentEvent[]> {
    return this.municipalityDatasource.getRecentEvents(munId)
  }

  async deleteRecentEvent(eventId: number): Promise<Boolean> {
    return this.municipalityDatasource.deleteRecentEvent(eventId)
  }

  async updateRecentEvent(eventId: number, event: RecentEvent): Promise<Boolean> {
    return this.municipalityDatasource.updateRecentEvent(eventId, event)
  }
}
