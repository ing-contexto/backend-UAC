import mysql from "mysql2/promise";
import { ResultSetHeader } from 'mysql2';
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
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT m.ID as clave, m.nombre AS nombre, d.nombre AS distrito, r.nombre AS region, mc.nombre AS colindantes, pc.nombre AS cardenal 
        FROM Municipio m INNER JOIN Distrito d ON m.distritoID = d.ID INNER JOIN Region r ON d.regionID = r.ID LEFT JOIN MunicipioColindante col 
        ON m.ID = col.municipioID LEFT JOIN Municipio mc ON col.colindanteID = mc.ID LEFT JOIN 
        PuntosCardinales pc ON col.puntoCardinalID = pc.ID WHERE m.ID IN (?)`,
        [munIds]
      );
      return rows as Municipality[];
    } finally {
      connection.release();
    }
  }

  async addNeighborings(munId: number, neighbors: number[]): Promise<Boolean> {
    const connection = await this.pool.getConnection();
    try {
      const placeholders = neighbors.map(_ => "(?,?,?)").join(", ")
      const values = neighbors.flatMap(n => [munId, n, 1])

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO MunicipioColindante (municipioID, colindanteID, puntoCardinalID) VALUES ${placeholders}`,
        values
      );
      return result.affectedRows > 0;
    } catch {
      return false
    } finally {
      connection.release();
    }
  }
}
