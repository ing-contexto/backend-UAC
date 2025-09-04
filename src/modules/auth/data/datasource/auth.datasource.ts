import user from "../../../users/domain/model/users";
import { userCredentials } from "../../model/userCredentials";
import { createPool, Pool, RowDataPacket } from "mysql2/promise";

export default class AuthDatasource {
  private pool: Pool;

  constructor() {
    this.pool = createPool(process.env.DATABASE_URL as string);
  }

  async signIn(credentials: userCredentials): Promise<user | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows] = await conn.execute<(user & RowDataPacket)[]>(
        "SELECT id, Correo as correo, Password as password FROM Usuario WHERE Usuario = ?",
        [credentials.email]
      );
      if (rows.length === 0) return null;
      return rows[0];
    } catch (error) {
      return null;
    } finally {
      conn.release();
    }
  }
}
