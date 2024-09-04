import express, { Request, Response } from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';
import logger from '../middleware/logger';
import { validateUsername, validateEmail, validatePassword } from '../middleware/validators';
import { authenticateToken } from '../middleware/authenticateToken';

export const routerUser = express.Router();

async function getDb() {
  return open({
    filename: 'mydb.sqlite',
    driver: sqlite3.Database
  });
}


interface userRequestBody{
  username:string,
  email:string,
  password:string
}


// clean table users
routerUser.delete('', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM users');
    logger.info('tentativo di svuotare la tabella users ricevuto')
    return res.status(200).json({ message: 'Tabella users svuotata con successo' });
  } catch (err) {
    if(err instanceof Error){
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({'message':'errore standar di js','errore':err.message})
    }else{
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});




routerUser.post('', async (req: Request, res: Response) => {
  try {
    const { username, email, password }: userRequestBody = req.body;
    console.log(req.body); // Per il debug

    if (!username || !email || !password) {
      logger.warn('Credenziali non inserite', req.body);
      return res.status(400).json({ message: 'Credenziali non inserite' });
    }

    logger.info('Tentativo di registrazione ricevuto');

    if (!validateUsername(username)) {
      logger.warn('Username non valido', username);
      return res.status(400).json({ message: 'Username non valido' });
    }

    if (!validateEmail(email)) {
      logger.warn('Email non valida', email);
      return res.status(400).json({ message: 'Email non valida' });
    }

    if (!validatePassword(password)) {
      logger.warn('Password non valida');
      return res.status(400).json({ message: 'Password non valida' });
    }

    const db = await getDb();
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      logger.warn('Utente già esistente');
      return res.status(400).json({ message: 'Utente già esistente' });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);

    logger.info('Utente registrato', user);
    return res.status(201).json({ message: 'Utente registrato', user }); // Assicurati che ci sia un `return` qui
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({ message: 'Errore interno al server', errore: err.message });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', errore: err });
    }
  }
});




// update user
routerUser.put('/update/:id', authenticateToken, async (req: Request, res: Response) => {

  try {

    const { username, password }: userRequestBody = req.body;
    const { id } = req.params; 

    if (!username || !password) {
      logger.warn('Credenziali non inserite', req.body);
      return res.status(400).json({ message: 'Credenziali non inserite' });
    }

    if (!id) {
      logger.warn('id non valido', req.params);
      return res.status(400).json({
         message:'id non valido'
      });
    }


    if (!validateUsername(username)) {
      logger.warn('Username non valido', username);
      return res.status(400).json({ message: 'Username non valido' });
    }



    if (!validatePassword(password)) {
      logger.warn('Password non valida');
      return res.status(400).json({ message: 'Password non valida' });
    }


    logger.info('Tentativo di aggiornamento ricevuto');

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const db = await getDb();
    const foundUser = await db.get('SELECT id FROM users WHERE id = ?', [id]);

    if (!foundUser) {
      logger.warn('Utente non trovato', id);
      return res.status(400).json({
        message:'Utente non trovato'
      });
    } else {
      const result = await db.run('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, passwordHash, id]);

      if (result.changes && result.changes> 0) {
        logger.info('Aggiornamento utente riuscito', { id, username });
        return res.status(200).json({ message: 'Utente aggiornato con successo' });
      } else {
        logger.warn('Nessuna modifica effettuata', { id, username });
        return res.status(400).json({ message: 'Nessuna modifica effettuata' });
      }
    }

  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({ message: 'Errore standard di JS', errore: err.message });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});





// delete user
routerUser.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      logger.warn('id non valido',id)
      return res.status(400).json({
        message:'id non valido'
     });
    }

    logger.info('tentativo di rimuovere un utente ricevuto')

    const db = await getDb();
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!existingUser) {
      logger.warn('Utente non trovato');
      return res.status(400).json({
        message:'Utente non trovato'
      });
    }

    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);

    if (result.changes && result.changes > 0) {
      logger.info('Utente eliminato con successo');
      return res.status(200).json({ message: 'Utente eliminato con successo' });
    } else {
      logger.warn("Errore nella cancellazione dell'utente")
      return res.status(500).json({ message: "Errore nella cancellazione dell'utente" });
    }
  } catch (err) {
    if(err instanceof Error){
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({'message':'errore standar di js','errore':err.message})
    }else{
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});


