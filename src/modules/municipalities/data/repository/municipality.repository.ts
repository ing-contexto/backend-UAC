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

  async getMunicipalities(munIds: number[]): Promise<Municipality[]> {
    return this.municipalityDatasource.getMunicipalities(munIds);
  }

  async addNeighborings(munId: number, neighbors: number[]): Promise<Boolean> {
    return this.municipalityDatasource.addNeighborings(munId, neighbors)
  }

  async addRecentEvent(hecho: HechoReciente, munIds: number[]): Promise<Boolean> {
    return this.municipalityDatasource.addRecentEvent(hecho, munIds)
  }
}
