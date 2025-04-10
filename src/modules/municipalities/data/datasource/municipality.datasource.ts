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

  async getMunicipalities(munId: number[]): Promise<Municipality[]> {
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
        [munId]
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
    event: RecentEvent,
    munId: number[]
  ): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO HechosRecientes (titulo, fecha, descripcion) VALUES (?, ?, ?)",
        [event.titulo, event.fecha, event.descripcion]
      );
      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }
      const recentEventID = result.insertId;
      if (munId.length > 0) {
        const placeholders = munId.map(() => "(?, ?)").join(", ");
        const values = munId.flatMap((id) => [id, recentEventID]);
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

  async getRecentEvents(munId: number[]): Promise<RecentEvent[]> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT hr.ID AS id_hecho,
            hr.titulo AS titulo,
            hr.fecha AS fecha,
            hr.descripcion AS descripcion,
            JSON_ARRAYAGG(m.ID) AS municipios
        FROM HechosRecientes hr
            LEFT JOIN Municipio_HechosRecientes mhr ON hr.ID = mhr.hechosRecientesID
            LEFT JOIN Municipio m ON mhr.municipioID = m.ID
        WHERE m.ID IS NOT NULL
        GROUP BY hr.ID,
            hr.titulo,
            hr.fecha,
            hr.descripcion
        HAVING SUM(m.ID IN (?)) > 0
        ORDER BY hr.fecha DESC`,
        [munId]
      );
      return rows as RecentEvent[];
    } finally {
      connection.release();
    }

  }

  async deleteRecentEvent(eventId: number): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        "DELETE FROM HechosRecientes WHERE ID = ?",
        [eventId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al eliminar el evento", error);
      return false;
    } finally {
      connection.release();
    }
  }
}
