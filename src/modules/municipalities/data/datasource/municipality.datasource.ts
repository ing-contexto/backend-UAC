import { Pool } from "pg";
import Municipality from "../../domain/model/municipality";

export default class MunicipalityDatasource {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async getMunicipality(munId: number): Promise<Municipality | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query("SELECT * FROM Municipio WHERE id=$1", [
        munId,
      ]);
      console.log(result);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }
}
