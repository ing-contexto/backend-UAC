import { createPool, Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import user from "../../domain/model/users";
import bcrypt from "bcrypt";
import rol from "../../domain/model/rol";

export default class UserDatasource {
    private pool: Pool;

    constructor() {
        this.pool = createPool(process.env.DATABASE_URL as string);
    }

    async getRoles(): Promise<rol[]> {
        const conn = await this.pool.getConnection();
        try {
            const [rows] = await conn.query<RowDataPacket[]>("SELECT * FROM Rol");
            return rows as unknown as rol[];
        } finally {
            conn.release();
        }
    }

    async getCurrentUser(userId: number): Promise<user | null> {
        const conn = await this.pool.getConnection();
        try {
            const [rows] = await conn.query<RowDataPacket[]>(
                "SELECT id, 'Nombre' AS nombre, 'Usuario' AS usuario, 'Correo' AS correo, 'Password' AS password, 'Rol_id' AS rol FROM Usuario WHERE id = ? LIMIT 1;",
                [userId]
            );
            return (rows as unknown as user[])[0] || null;
        } finally {
            conn.release();
        }
    }

    async createUser(newUser: user): Promise<user | null> {
        console.log("1")
        const conn = await this.pool.getConnection();
        console.log("2")
        try {
            const hashed = bcrypt.hashSync(newUser.password, 10);
            console.log("3")
            const sqlAuto =
                "INSERT INTO Usuario ('Nombre', 'Usuario', 'Correo', 'Password', 'Rol_id') VALUES (?, ?, ?, ?, ?)";

            const paramsAuto = [newUser.nombre, newUser.usuario, newUser.correo, hashed, newUser.rol];

            const [result] = await conn.execute<ResultSetHeader>(sqlAuto, paramsAuto);
            console.log("4")

            const id = (result as ResultSetHeader).insertId;
            console.log("5")
            return await this.getCurrentUser(id);
        } catch {
            return null;
        } finally {
            conn.release();
        }
    }


    async updateUser(userId: number, updated: user): Promise<user | null> {
        const conn = await this.pool.getConnection();
        try {
            const sets: string[] = ["'Nombre' = ?", "'Usuario' = ?", "'Correo' = ?", "'Rol_id' = ?"];
            const params: any[] = [updated.nombre, updated.usuario, updated.correo, updated.rol];
            if (updated.password && updated.password.trim().length > 0) {
                sets.push("'Password' = ?");
                params.push(bcrypt.hashSync(updated.password, 10));
            }
            params.push(userId);
            const sql = `UPDATE Usuario SET ${sets.join(", ")} WHERE id = ?`;
            const [res] = await conn.execute<ResultSetHeader>(sql, params);
            if ((res.affectedRows ?? 0) === 0) return null;
            return await this.getCurrentUser(userId);
        } finally {
            conn.release();
        }
    }

    async deleteUser(userId: number): Promise<boolean> {
        const conn = await this.pool.getConnection();
        try {
            const [res] = await conn.execute<ResultSetHeader>("DELETE FROM Usuario WHERE 'id' = ?", [userId]);
            return (res.affectedRows ?? 0) > 0;
        } finally {
            conn.release();
        }
    }
}
