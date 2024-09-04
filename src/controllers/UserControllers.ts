import { User } from "../models/UserModel";
import { AuthController } from "./AuthController";


export class UserController {
    private users: User[];
    authControllers: AuthController;
  
    constructor() {
      this.users = [];
      this.authControllers = new AuthController(this);
    }

  registerUser(
    username: string,
    email: string,
    password: string
  ) {
    try {
      const foundUser = this.users.find(
        (user) =>  email === user.email && username === user.username
      );

      if (!!foundUser) {
        console.log(`utente già esistente`);
        return false
      } else {
        const user = new User(username, email, password);
        this.users = [...this.users, user];
        return true;
      }
    } catch (error) {
      console.log("errore", error);
      return false;
    }
  }

  getAllUsers(): User[] {
    return this.users;
  }

  getUser(primaryKeyUser: string) {
    try {
      const user = this.users.find(
        (user) => primaryKeyUser === user.primaryKeyUser
      );
      return user || null;
    } catch (error) {
      console.log("errore", error);
      return false;
    }
 
  }

  updateUser(primaryKeyUser: string, username: string, password: string, token: string) {
    try {
        
        const foundUser = this.users.find(user => primaryKeyUser === user.primaryKeyUser);

        if (!foundUser) {
            console.log('Utente non trovato');
            return false; 
        } 


        if (this.authControllers.isValidToken(token, primaryKeyUser)) {
            
            foundUser.username = username;
            foundUser.password = password;

            console.log('Utente aggiornato con successo');
            return true; 
        } else {
            console.log('Token non valido');
            return false;
        }

    } catch (error) {
        console.log("Errore", error);
        return false; 
    }
}



  removeUser(primaryKeyUser: string) {
    try {
      this.users = this.users.filter(
        (user) => primaryKeyUser !== user.primaryKeyUser
      );
    } catch (error) {
      console.log("errore", error);
      return false;
    }
   
  }

  logAllUsers() {
    console.log("All users:", JSON.stringify(this.getAllUsers(), null, 2));
  }
}
