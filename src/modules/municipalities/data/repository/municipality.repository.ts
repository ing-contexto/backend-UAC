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
    const mun: Municipality[] = await this.municipalityDatasource.getMunicipalities(munIds);
    const municipiosMap = new Map<string, Municipality>();

    mun.forEach(m => {
      if (!municipiosMap.has(m.nombre)) {
        municipiosMap.set(m.nombre, {
          clave: m.clave,
          nombre: m.nombre,
          distrito: m.distrito,
          region: m.region,
          colindantes: []
        });
      }

      const municipio = municipiosMap.get(m.nombre)!;
      if (m.colindantes) {
        const colindantes = Array.isArray(m.colindantes) ? m.colindantes : [m.colindantes];
        (municipio.colindantes as String[]).push(...colindantes);
      }
    });
    const result: Municipality[] = Array.from(municipiosMap.values());

    return result;
  }

  async addNeighborings(munId: number, neighbors: number[]): Promise<Boolean> {
    return this.municipalityDatasource.addNeighborings(munId, neighbors)
  }
}
