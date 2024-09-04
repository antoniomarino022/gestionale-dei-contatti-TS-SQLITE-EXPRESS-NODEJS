import express, { Response, Request } from "express";
import { config } from "dotenv";
import * as bcrypt from "bcrypt";
import logger from "../middleware/logger";
import { generateAccessToken, authenticateToken } from "../middleware/authenticateToken";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { validateEmail, validatePassword } from "../middleware/validators";

config()
  
export const routerAuth = express.Router();

async function getDb() {
    return open({
      filename: 'mydb.sqlite',
      driver: sqlite3.Database
    });
  };


  // clean table auth
  routerAuth.delete('', async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      await db.run('DELETE FROM auth');
      logger.info('tentativo di svuotare la tabella auth ricevuto')
      return res.status(200).json({ message: 'Tabella auth svuotata con successo' });
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

  


  // login

  routerAuth.post('/login',async (req:Request,res:Response)=>{

    try {
      
      const { email, password } = req.body

      if(!email || !password){
        logger.warn('parametri mancanti');
        res.status(400).json({
          'message':'parametri mancanti'
        });
      };

      logger.info('tentativo di login ricevuto');

      if(!validateEmail(email)){
        logger.warn('email non valida',email);
        res.status(400).json({
          'message':'email non valida'
        });
      };


      if(!validatePassword(password)){
        logger.warn('password non valida');
        res.status(400).json({
          'message':'password non valida'
        });
      };


    const db = await getDb()  
    const userVerify = await db.get('SELECT * FROM users WHERE email = ?',[email]);


    if (!userVerify) {
      logger.warn(`Email o password non corretti ${email}`)
      return res.status(401).json({
        message: "Email o password non corretti",
      });
    }

    logger.info('tentativo di login ricevuto',email);

    

    const match = await bcrypt.compare(password, userVerify.password);

    if(match){
      const userId = userVerify.id
      const token = generateAccessToken(userId);

      const success = await db.run('INSERT INTO auth (userId,token) VALUES (?,?)',[userId,token]);

      if (success.changes && success.changes > 0) {
        logger.info(`login effettuato ${email} `)
        return res.status(200).json({ message: 'login effettuato',token});
      } else {
        logger.error(`si è verificato un errore durante il login ${email} `)
        return res.status(500).json({ message: "si è verificato un errore durante il login" });
      }
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
  })




  // logout
routerAuth.delete('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      logger.warn('Nessun header di autorizzazione presente');
      return res.status(401).json({ message: 'Autorizzazione mancante' });
    }
    const token = authHeader?.split(" ")[1];

    if (!token) {
      logger.warn('Token mancante o non valido', { token });
      return res.status(400).json({
        message: 'Token mancante o non valido'
      });
    }

    logger.info('Tentativo di logout ricevuto', { token });

    const verifyUser = await db.get('SELECT * FROM auth WHERE token = ?', [token]);

    if (!verifyUser) {
      return res.status(400).json({
        message: 'Token non corrispondente'
      });
    }

    const result = await db.run('DELETE FROM auth WHERE token = ?', [token]);

    if (result.changes && result.changes  > 0) {
      logger.info('Logout effettuato con successo', { token });
      return res.status(200).json({
        message: 'Logout effettuato con successo'
      });
    } else {
      logger.error('Errore durante il logout', { token });
      return res.status(500).json({
        message: 'Si è verificato un errore durante il logout'
      });
    }

  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({
        message: 'Errore standard di JS',
        errore: err.message
      });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({
        message: 'Errore sconosciuto',
        err
      });
    }
  }
});



