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
        `SELECT m.ID AS clave,
          m.nombre AS nombre,
          d.nombre AS distrito,
          r.nombre AS region,
          GROUP_CONCAT(
              DISTINCT mc.nombre
              ORDER BY mc.nombre SEPARATOR '; '
          ) AS colindantes,
          GROUP_CONCAT(
              DISTINCT hr.titulo
              ORDER BY hr.fecha DESC SEPARATOR ' ||| '
          ) AS hechos
      FROM Municipio m
          INNER JOIN Distrito d ON m.distritoID = d.ID
          INNER JOIN Region r ON d.regionID = r.ID
          LEFT JOIN MunicipioColindante col ON m.ID = col.municipioID
          LEFT JOIN Municipio mc ON col.colindanteID = mc.ID
          LEFT JOIN Municipio_HechosRecientes mhr ON m.ID = mhr.municipioID
          LEFT JOIN HechosRecientes hr ON mhr.hechosRecientesID = hr.ID
      WHERE m.ID IN (?)
      GROUP BY m.ID,
          m.nombre,
          d.nombre,
          r.nombre`,
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
  async addRecentEvent(
    hecho: HechoReciente,
    munIds: number[]
  ): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insertar el hecho reciente
      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO HechosRecientes (titulo, fecha, descripcion) VALUES (?, ?, ?)",
        [hecho.titulo, hecho.fecha, hecho.descripcion]
      );
      console.log(result)

      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }

      const hechosRecientesID = result.insertId;

      // Asociar a municipios
      if (munIds.length > 0) {
        const placeholders = munIds.map(() => "(?, ?)").join(", ");
        const values = munIds.flatMap((id) => [id, hechosRecientesID]);

        await connection.query(
          `INSERT INTO Municipio_HechosRecientes (municipioID, hechosRecientesID) VALUES ${placeholders}`,
          values
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      console.log(error);
      await connection.rollback();
      return false;
    } finally {
      connection.release();
    }
  }

}
