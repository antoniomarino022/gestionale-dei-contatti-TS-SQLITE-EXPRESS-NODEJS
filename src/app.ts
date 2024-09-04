import { UserController } from "./controllers/UserControllers";
import { AuthController } from "./controllers/AuthController";
import { ContactsControllers } from "./controllers/ContactsControllers";


const userController = new UserController();
const authController = new AuthController(userController);
const contactsController = new ContactsControllers(userController, authController);


// registrazione di un utente
userController.registerUser('testUser', 'test@example.com', 'password123');
userController.logAllUsers();


// Accesso con un utente registrato
const loginSuccess = authController.login(userController.getAllUsers()[0].primaryKeyUser);
if (loginSuccess) {
    console.log("Login effettuato con successo!");
} else {
    console.log("Login fallito!");
}


// Aggiungere un contatto
const token = authController.getAllAuths()[0]?.token;
const userId = userController.getAllUsers()[0].primaryKeyUser;
contactsController.addContact(token, userId, 'John', 'Doe', 'john.doe@example.com', 1234567890);
contactsController.logAllContacts(token, userId);



// Recuperare un contatto
const contact = contactsController.getContact(token, userId, 1234567890);
console.log('Contact retrieved:', contact);


// Aggiornare un contatto
contactsController.updateContact(token, userId, 'John', 'Doe', 'john.newemail@example.com', 1234567890);
contactsController.logAllContacts(token, userId);


// Rimuovere un contatto
contactsController.removeContact(token, userId, 1234567890);
contactsController.logAllContacts(token, userId);



// Logout dell'utente
const logoutSuccess = authController.logout(token, userId);
if (logoutSuccess) {
    console.log("Logout effettuato con successo!");
} else {
    console.log("Logout fallito!");
}
