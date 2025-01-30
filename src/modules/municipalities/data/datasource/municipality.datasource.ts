import mysql from "mysql2/promise";
import Municipality from "../../domain/model/municipality";
import dotenv from "dotenv";
dotenv.config();

export default class MunicipalityDatasource {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
    });
  }

  async getMunicipality(munId: number): Promise<Municipality | null> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM Municipio WHERE id = ?",
        [munId]
      );
      return (rows as Municipality[])[0] || null;
    } finally {
      connection.release();
    }
  }

  async getMunicipalities(munIds: number[]): Promise<Municipality[]> {
    if (munIds.length === 0) {
      return [];
    }

    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT m.id AS 'id', m.nombre, d.nombre AS 'distrito', r.nombre AS 'region'
        FROM Municipio m INNER JOIN Distrito d ON m.ID = d.ID INNER JOIN Region r ON d.regionID=r.ID
        WHERE m.ID in (?)`,
        [munIds]
      );
      return rows as Municipality[];
    } finally {
      connection.release();
    }
  }
}
