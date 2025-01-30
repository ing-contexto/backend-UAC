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
}
