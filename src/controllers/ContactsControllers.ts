import { Contacts } from "../models/ContactsModel";
import { UserController } from "./UserControllers";
import { AuthController } from "./AuthController";

export class ContactsControllers{
    private addressBook:Contacts[];
    private userController:UserController;
    private authController:AuthController;

    constructor(userController:UserController,authController:AuthController){
        this.addressBook = [];
        this.userController = userController;
        this.authController = authController
    }
 
    addContact(token:string, idUser:string, name:string, surname:string, email:string, tel:number){
        const auth = this.authController.isValidToken(token,idUser)

        if(!auth){
            console.log('token non valido');
        }else{
            const contact = new Contacts(name,surname,email,tel);
            this.addressBook = [...this.addressBook,contact];
        }
    }

    getAllContacts(token:string,idUser:string){
        const auth = this.authController.isValidToken(token,idUser);

        if(!auth){
            console.log('token non valido');
            return []
        }else{
            return this.addressBook;
        }
    }

    getContact(token:string,idUser:string,tel:number){

        const auth = this.authController.isValidToken(token,idUser);

        if(!auth){
            console.log('token non valido');
        }else {
            return this.addressBook.find((contact)=>tel === contact.tel)
        }
    }

    updateContact(token:string,idUser:string,name:string,surname:string,email:string,tel:number){
        const auth = this.authController.isValidToken(token,idUser);

        if(!auth){
            console.log('token non valido');
        }else {
            this.addressBook = this.addressBook.map((contact) =>{
                if(tel === contact.tel){
                    return {...contact,name,surname,email}
                }else return contact
            })
        }
    }

    removeContact(token:string,idUser:string,tel:number){
        const auth = this.authController.isValidToken(token,idUser);

        if(!auth){
            console.log('token non valido');
        }else {
         this.addressBook = this.addressBook.filter((contact)=>tel !== contact.tel)
        }
    }

    logAllContacts(token:string,idUser:string){
        console.log('All contacts:', JSON.stringify(this.getAllContacts(token,idUser), null, 2));
    }

}