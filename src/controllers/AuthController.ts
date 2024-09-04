import { Auth } from "../models/AuthModel";
import { UserController } from "./UserControllers";

export class AuthController{
   private auths:Auth[];
   private userController:UserController;

    constructor(userController:UserController){
        this.auths = []
        this.userController =userController
    }

    
    isValidToken(token:string, idUser:string){
       const authFound = this.auths.find((auth)=> token === auth.token && idUser === auth.idUser);  
       return !!authFound;
    }


    login(primaryKeyUser:string){

        const foundUser = this.userController.getAllUsers().find((user)=>primaryKeyUser === user.primaryKeyUser);

        if(!foundUser){
            console.log('utente non trovato');
        }else{
            const newAuth = new Auth(foundUser.primaryKeyUser);
            this.auths = [...this.auths, newAuth];
            return true;
        }
    }


    logout(token: string, idUser: string) {
        try {
            const auth = this.auths.find(auth => idUser === auth.idUser && token === auth.token);
    
            if (!auth) {
                console.log('Utente non trovato o token non valido');
                return false;
            } else {
               
                this.auths = this.auths.filter(auth => !(auth.idUser === idUser && auth.token === token));
                console.log('Logout effettuato con successo');
                return true;
            }
        } catch (error) {
            console.log("Errore", error);
            return false; 
        }
    }


    getAllAuths(){
        return this.auths
    }


    getAuth(token:string,idUsers:string){

        try {
            return this.auths.find((auth)=> token === auth.token && idUsers === auth.idUser);
        } catch (error) {
            console.log("Errore", error);
            return false; 
        }
    }


    logAllAuth() {
        console.log("All auths:", JSON.stringify(this.getAllAuths(), null, 2));
      }


    
}