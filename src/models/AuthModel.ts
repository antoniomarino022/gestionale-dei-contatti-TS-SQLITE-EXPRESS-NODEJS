import { User } from "./UserModel";
import  jwt  from "jsonwebtoken";

export class Auth {
    idUser:User["primaryKeyUser"];
    token:string;

    constructor(idUser:string){
        this.idUser = idUser
        this.token = jwt.sign({ foo: "bar" }, "privateKey", {
            expiresIn: "1h",
          });
    }
}