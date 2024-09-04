import { v4 as uuidv4 } from 'uuid';

export class User{
    username:string;
    email:string;
    password:string;
    primaryKeyUser:string;
    constructor(name:string,email:string,password:string){
        this.username = name;
        this.email = email
        this.password = password
        this.primaryKeyUser = uuidv4();
    }

}