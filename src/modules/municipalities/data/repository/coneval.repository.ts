import ConevalData from "../../domain/model/conevalData";
import ConevalDatasource from "../datasource/coneval.datasource";

export default class ConevalRepository {
    private conevalDatasource: ConevalDatasource;

    constructor(datasource: ConevalDatasource) {
        this.conevalDatasource = datasource;
    }

    async getConevalData(munIds: number[]): Promise<ConevalData[]> {
        return this.conevalDatasource.getConevalData(munIds);
    }
}