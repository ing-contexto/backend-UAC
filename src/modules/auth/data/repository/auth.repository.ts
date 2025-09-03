import user from "../../../users/domain/model/users";
import { userCredentials } from "../../model/userCredentials";
import AuthDatasource from "../datasource/auth.datasource";

export class AuthRepository {
  private dataSource: AuthDatasource;

  constructor(private datasource: AuthDatasource) {
    this.dataSource = datasource;
  }

  sigIn(credentials: userCredentials): Promise<user | null> {
    return this.dataSource.signIn(credentials);
  }
}
