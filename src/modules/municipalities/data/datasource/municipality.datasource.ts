import mysql from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from 'mysql2';
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
    if (munId.length === 0) return [];

    const connection = await this.pool.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT 
        m.ID AS clave,
        m.nombre AS nombre,
        d.nombre AS distrito,
        r.nombre AS region,
        m.archivoSistema AS archivoSistema,
        GROUP_CONCAT(
          DISTINCT mc.nombre
          ORDER BY mc.nombre SEPARATOR '; '
        ) AS colindantes,
        GROUP_CONCAT(
          DISTINCT hr.titulo
          ORDER BY hr.fecha DESC SEPARATOR ' ||| '
        ) AS hechos,
        GROUP_CONCAT(
          DISTINCT l.nombre
          ORDER BY l.nombre SEPARATOR '; '
        ) AS localidades
      FROM Municipio m
        INNER JOIN Distrito d ON m.distritoID = d.ID
        INNER JOIN Region r ON d.regionID = r.ID
        LEFT JOIN MunicipioColindante col ON m.ID = col.municipioID
        LEFT JOIN Municipio mc ON col.colindanteID = mc.ID
        LEFT JOIN Municipio_HechosRecientes mhr ON m.ID = mhr.municipioID
        LEFT JOIN HechosRecientes hr ON mhr.hechosRecientesID = hr.ID
        LEFT JOIN Localidad l ON l.municipioID = m.ID
      WHERE m.ID IN (?)
      GROUP BY m.ID, m.nombre, d.nombre, r.nombre, m.archivoSistema;`,
        [munId]
      );

      const municipios = rows as Municipality[];

      const [grupoRows] = await connection.query(
        `SELECT 
        mgc.municipioID AS municipioID,
        gc.ID AS id,
        gc.nombre AS nombre,
        gc.tipo AS tipo,
        gc.anio AS anio
      FROM Municipio_GrupoCriminal mgc
      INNER JOIN GrupoCriminal gc ON gc.ID = mgc.grupoCriminalID
      WHERE mgc.municipioID IN (?)
      ORDER BY mgc.municipioID, gc.anio DESC, gc.tipo, gc.nombre;`,
        [munId]
      );

      const gruposPorMunicipio = new Map<number, any[]>();

      for (const grupo of grupoRows as any[]) {
        if (!gruposPorMunicipio.has(grupo.municipioID)) {
          gruposPorMunicipio.set(grupo.municipioID, []);
        }

        gruposPorMunicipio.get(grupo.municipioID)!.push({
          id: grupo.id,
          nombre: grupo.nombre,
          tipo: grupo.tipo,
          anio: grupo.anio
        });
      }

      return municipios.map((municipio) => ({
        ...municipio,
        gruposCriminales: gruposPorMunicipio.get(municipio.clave) ?? []
      }));
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
  ): Promise<RecentEvent> {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO HechosRecientes (titulo, fecha, descripcion, link, conflictividadID) VALUES (?, ?, ?, ?, ?)",
        [event.titulo, event.fecha, event.descripcion, event.link, event.conflictividad.id]
      );

      if (result.affectedRows === 0) {
        throw new Error("No se pudo insertar el hecho reciente");
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

      return {
        ...event,
        id: recentEventID,
        municipios: munId,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getRecentEvents(munId: number[]): Promise<RecentEvent[]> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        `SELECT 
          hr.ID AS id_hecho,
          hr.titulo AS titulo,
          hr.fecha AS fecha,
          hr.descripcion AS descripcion,
          hr.link AS link,
          cs.ID AS conflictividad_id,
          cs.tipo AS conflictividad_tipo,
          JSON_ARRAYAGG(m.ID) AS municipios
       FROM HechosRecientes hr
       LEFT JOIN ConflictividadSocial cs ON cs.ID = hr.conflictividadID
       LEFT JOIN (
         SELECT DISTINCT hechosRecientesID, municipioID
         FROM Municipio_HechosRecientes
       ) mhr ON hr.ID = mhr.hechosRecientesID
       LEFT JOIN Municipio m ON mhr.municipioID = m.ID
       WHERE m.ID IS NOT NULL
       GROUP BY 
          hr.ID, hr.titulo, hr.fecha, hr.descripcion, hr.link,
          cs.ID, cs.tipo
       HAVING SUM(m.ID IN (?)) > 0
       ORDER BY hr.fecha DESC`,
        [munId]
      );

      const result = rows.map(r => ({
        id: r.id_hecho,
        titulo: r.titulo,
        fecha: r.fecha,
        descripcion: r.descripcion,
        link: r.link,
        conflictividad: r.conflictividad_id != null ? { id: r.conflictividad_id, tipo: r.conflictividad_tipo } : null,
        municipios: typeof r.municipios === 'string' ? JSON.parse(r.municipios) : r.municipios
      }));

      return result as RecentEvent[];
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

  async updateRecentEvent(
    eventId: number,
    event: RecentEvent,
    munIds?: number[]
  ): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [u] = await connection.execute<ResultSetHeader>(
        "UPDATE HechosRecientes SET titulo = ?, fecha = ?, descripcion = ?, link = ?, conflictividadID = ? WHERE id = ? LIMIT 1",
        [event.titulo, event.fecha, event.descripcion, event.link, event.conflictividad, eventId]
      );

      if (Array.isArray(munIds)) {
        const ids = Array.from(new Set(munIds)).filter((n) => Number.isFinite(n));
        await connection.execute(
          "DELETE FROM Municipio_HechosRecientes WHERE hechosRecientesID = ?",
          [eventId]
        );
        if (ids.length > 0) {
          const placeholders = ids.map(() => "(?, ?)").join(", ");
          const values = ids.flatMap((id) => [id, eventId]);
          await connection.execute(
            `INSERT INTO Municipio_HechosRecientes (municipioID, hechosRecientesID) VALUES ${placeholders}`,
            values
          );
        }
      }

      await connection.commit();

      if (u.affectedRows > 0) return true;
      const [rows] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM HechosRecientes WHERE id = ? LIMIT 1",
        [eventId]
      );
      return rows.length > 0;
    } catch {
      await connection.rollback();
      return false;
    } finally {
      connection.release();
    }
  }

}
