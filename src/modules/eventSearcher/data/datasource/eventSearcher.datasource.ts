import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const STOPWORDS = new Set(["de", "la", "las", "los", "y", "o", "a", "en", "del", "al", "por", "para", "con", "se", "un", "una", "uno", "que", "su", "sus", "es", "el"]);

function tokenize(q: string) {
    return q
        .toLowerCase()
        .normalize("NFKD")
        .replace(/\p{M}+/gu, "")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

function hasIndexable(tokens: string[]) {
    return tokens.some(w => w.length >= 4 && !STOPWORDS.has(w));
}

export default class EventSearcherDatasource {
    private pool: mysql.Pool;

    constructor() {
        this.pool = mysql.createPool({
            uri: process.env.DATABASE_URL,
        });
    }

    async searchRecentEvents(keyword: string): Promise<RecentEvent[]> {
        const conn = await this.pool.getConnection();
        try {
            const tokens = tokenize(keyword);
            const indexable = hasIndexable(tokens);
            const phraseQuoted = `"${keyword.replace(/"/g, '\\"')}"`;
            if (indexable) {
                const [rows] = await conn.execute<any[]>(
                    `SELECT 
                        hr.ID AS id_hecho,
                        hr.titulo AS titulo,
                        hr.fecha AS fecha,
                        hr.descripcion AS descripcion,
                        hr.link AS link,
                        cs.ID AS conflictividad_id,
                        cs.tipo AS conflictividad_tipo,
                        JSON_ARRAYAGG(m.ID) AS municipios,
                        MATCH(hr.titulo, hr.descripcion) AGAINST(? IN BOOLEAN MODE) AS score
                        FROM HechosRecientes AS hr
                        LEFT JOIN ConflictividadSocial AS cs ON cs.ID = hr.conflictividadID
                        LEFT JOIN (
                        SELECT DISTINCT hechosRecientesID, municipioID
                        FROM Municipio_HechosRecientes
                        ) mhr ON hr.ID = mhr.hechosRecientesID
                        LEFT JOIN Municipio m ON mhr.municipioID = m.ID
                        WHERE MATCH(hr.titulo, hr.descripcion) AGAINST(? IN BOOLEAN MODE)
                        GROUP BY
                        hr.ID, hr.titulo, hr.fecha, hr.descripcion, hr.link,
                        cs.ID, cs.tipo
                        ORDER BY score DESC, hr.fecha DESC
                        LIMIT 50 OFFSET 0`,
                    [phraseQuoted, phraseQuoted]
                );
                if (rows.length > 0) {
                    return rows.map(r => ({
                        id: r.id_hecho,
                        titulo: r.titulo,
                        fecha: r.fecha,
                        descripcion: r.descripcion,
                        link: r.link,
                        conflictividad: r.conflictividad_id != null ? { id: r.conflictividad_id, tipo: r.conflictividad_tipo } : null,
                        municipios: Array.isArray(r.municipios)
                            ? r.municipios.filter((x: any) => x !== null)
                            : typeof r.municipios === "string"
                                ? JSON.parse(r.municipios).filter((x: any) => x !== null)
                                : []
                    })) as RecentEvent[];
                }
            }
            const [fallback] = await conn.execute<any[]>(
                `SELECT 
                    hr.ID AS id_hecho,
                    hr.titulo AS titulo,
                    hr.fecha AS fecha,
                    hr.descripcion AS descripcion,
                    hr.link AS link,
                    cs.ID AS conflictividad_id,
                    cs.tipo AS conflictividad_tipo,
                    JSON_ARRAYAGG(m.ID) AS municipios
                FROM HechosRecientes AS hr
                LEFT JOIN ConflictividadSocial AS cs ON cs.ID = hr.conflictividadID
                LEFT JOIN (
                    SELECT DISTINCT hechosRecientesID, municipioID
                    FROM Municipio_HechosRecientes
                ) mhr ON hr.ID = mhr.hechosRecientesID
                LEFT JOIN Municipio m ON mhr.municipioID = m.ID
                WHERE CONCAT_WS(' ', hr.titulo, hr.descripcion) LIKE CONCAT('%', ?, '%')
                GROUP BY
                    hr.ID, hr.titulo, hr.fecha, hr.descripcion, hr.link,
                    cs.ID, cs.tipo
                ORDER BY hr.fecha DESC
                LIMIT 50 OFFSET 0`,
                [keyword]
            );
            return fallback.map(r => ({
                id: r.id_hecho,
                titulo: r.titulo,
                fecha: r.fecha,
                descripcion: r.descripcion,
                link: r.link,
                conflictividad: r.conflictividad_id != null ? { id: r.conflictividad_id, tipo: r.conflictividad_tipo } : null,
                municipios: Array.isArray(r.municipios)
                    ? r.municipios.filter((x: any) => x !== null)
                    : typeof r.municipios === "string"
                        ? JSON.parse(r.municipios).filter((x: any) => x !== null)
                        : []
            })) as RecentEvent[];
        } finally {
            conn.release();
        }
    }

}
