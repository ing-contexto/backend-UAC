import rol from "../../domain/model/rol";
import user from "../../domain/model/users";
import DatabaseDataSource from "../datasource/user.datasource";

export default class UserRepository {
    private databaseDataSource: DatabaseDataSource;

    constructor(datasource: DatabaseDataSource) {
        this.databaseDataSource = datasource;
    }

    async getRoles(): Promise<rol[]> {
        return this.databaseDataSource.getRoles();
    }

    async getCurrentUser(userId: number): Promise<user | null> {
        return this.databaseDataSource.getCurrentUser(userId);
    }

    async createUser(newUser: user): Promise<user | null> {
        return this.databaseDataSource.createUser(newUser);
    }

    async updateUser(userId: number, updatedUser: user): Promise<user | null> {
        return this.databaseDataSource.updateUser(userId, updatedUser);
    }

    async deleteUser(userId: number): Promise<boolean> {
        return this.databaseDataSource.deleteUser(userId);
    }
}