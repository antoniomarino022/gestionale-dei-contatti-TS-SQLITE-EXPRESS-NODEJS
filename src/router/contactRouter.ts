import express, { Response, Request, response } from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { config } from "dotenv";
import logger from "../middleware/logger";
import {authenticateToken} from "../middleware/authenticateToken";

config();

export const routerContact = express.Router();

async function getDb() {
  return open({
    filename: "mydb.sqlite",
    driver: sqlite3.Database,
  });
}

interface contactRequestBody {
  userId:number,
  contactName: string;
  contactEmail: string;
  number: string;
}

function validNumber(number: string): boolean {
  const regex = /^\d{9}$/;
  return regex.test(number);
}

// clear table contacts
routerContact.delete(
  "/clear",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        logger.warn("Nessun header di autorizzazione presente");
        return res.status(401).json({ message: "Autorizzazione mancante" });
      }
      const token = authHeader && authHeader.split(" ")[1];

      logger.info("tentativo di svuotare la tabella contacts ricevuto");

      const db = await getDb();

      const verifyUser = await db.get(
        "SELECT userId FROM auth WHERE token = ?",
        [token]
      );

      if (!verifyUser) {
        logger.warn("Utente non autenticato", { token });
        return res.status(401).json({ message: "Utente non autenticato" });
      }

      const result = await db.run("DELETE FROM contacts");

      if (result.changes && result.changes > 0) {
        logger.info("tabella contact svuotata con successo");
        return res
          .status(200)
          .json({ message: "tabella contacts svuotata con successo" });
      } else {
        logger.error("tabella contact non svuotata ");
        return res
          .status(500)
          .json({ message: "tabella contacts non  svuotata " });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error("errore standard di js", err.message);
        return res
          .status(500)
          .json({ message: "errore standar di js", errore: err.message });
      } else {
        logger.error("errore sconosciuto", err);
        return res
          .status(500)
          .json({ message: "errore sconosciuto", errore: err });
      }
    }
  }
);

//  add contact
routerContact.post(
  "",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      const { userId, contactName, contactEmail, number }: contactRequestBody =
        req.body;

      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        logger.warn("Nessun header di autorizzazione presente");
        return res.status(401).json({
          message: "Nessun header di autorizzazione presente",
        });
      }

      const token = authHeader && authHeader.split(" ")[1];

      if (!userId || !contactName || !contactEmail || !number) {
        logger.warn("Parametri mancanti nella richiesta", { body: req.body });
        return res
          .status(400)
          .json({ message: "Parametri mancanti nella richiesta" });
      }

      if (!validNumber(number)) {
        logger.warn("numero non valido", number);
        return res
          .status(400)
          .json({ message: "numero non valido", number: req.body.number });
      }

      logger.info("Tentativo di aggiungere un prodotto ricevuto");

      const verifyUser = await db.get(
        "SELECT userId FROM auth WHERE token = ?",
        [token]
      );

      if (!verifyUser) {
        logger.warn("Utente non autenticato", { token });
        return res.status(401).json({ message: "Utente non autenticato" });
      } else {
        const result = await db.run(
          "INSERT INTO contacts (userId,contactName, contactEmail, number) VALUES (?, ?, ?, ?)",
          [userId,contactName, contactEmail, number]
        );

        if (result.changes && result.changes > 0) {
          logger.info("contatto aggiunto con successo", {
            contactId: result.lastID,
          });
          return res.status(201).json({
            message: "contatto aggiunto con successo",
            contact: result.lastID,
          });
        } else {
          logger.error("contatto non aggiunto");
          return res.status(500).json({ message: "contatto non aggiunto" });
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Errore JavaScript durante l'aggiunta del contatto", {
          error: err.message,
        });
        return res
          .status(500)
          .json({
            message: "Errore standard di JavaScript",
            error: err.message,
          });
      } else {
        logger.error("Errore sconosciuto durante l'aggiunta del contatto", {
          error: err,
        });
        return res.status(500).json({ message: "Errore sconosciuto" });
      }
    }
  }
);

//  update contact
routerContact.put(
  "/update/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      const { contactName, contactEmail, number }: contactRequestBody =
        req.body;
      const { id } = req.params;

      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        logger.warn("Nessun header di autorizzazione presente");
        return res.status(401).json({
          message: "Nessun header di autorizzazione presente",
        });
      }

      const token = authHeader && authHeader.split(" ")[1];

      if (!contactName || !contactEmail || !number) {
        logger.warn("Parametri mancanti nella richiesta", { body: req.body });
        return res
          .status(400)
          .json({ message: "Parametri mancanti nella richiesta" });
      }

      if (!validNumber(number)) {
        logger.warn("numero non valido", number);
        return res
          .status(400)
          .json({ message: "numero non valido", number: req.body.number });
      }

      if (!id) {
        logger.warn("id non valido o mancante", id);
        return res.status(400).json({
          message: "id non valido o mancante",
        });
      }

      logger.info("tentativo di aggiornare un contatto ricevuto");

      const verifyUser = await db.get(
        "SELECT userId FROM auth WHERE token = ?",
        [token]
      );

      if (!verifyUser) {
        logger.warn("Utente non autenticato", { token });
        return res.status(401).json({ message: "Utente non autenticato" });
      } else {
        const result = await db.run(
          "UPDATE contacts SET contactName = ?, contactEmail = ?, number = ? WHERE id = ?",
          [contactName, contactEmail, number, id]
        );

        if (result.changes && result.changes > 0) {
          logger.info("contatto  aggiornato con successo", id);
          return res.status(200).json({
            message: "contatto aggiornato con successo",
            contactId: id,
          });
        } else {
          logger.warn("Nessuna modifica apportata al contatto");
          return res.status(400).json({
            message: "Nessuna modifica apportata al contatto",
          });
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Errore JavaScript durante l'aggiornamento del prodotto", {
          error: err.message,
        });
        return res
          .status(500)
          .json({
            message: "Errore standard di JavaScript",
            error: err.message,
          });
      } else {
        logger.error(
          "Errore sconosciuto durante l'aggiornamento del prodotto",
          { error: err }
        );
        return res.status(500).json({ message: "Errore sconosciuto" });
      }
    }
  }
);

// delete contact
routerContact.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      const { id } = req.params;

      if (!id) {
        logger.warn("id mancante", id);
        return res.status(400).json({
          message: "id mancante",
        });
      }

      logger.info("tentativo di eliminare un contatto ricevuto");

      const existingcontact = await db.get(
        "SELECT id FROM contacts WHERE id = ?",
        [id]
      );

      if (!existingcontact) {
        return res.status(404).json({
          message: "contatto non trovato",
        });
      }

      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        logger.warn("Nessun header di autorizzazione presente");
        return res.status(401).json({
          message: "Nessun header di autorizzazione presente",
        });
      }
      const token = authHeader && authHeader.split(" ")[1];

      const verifyUser = await db.get(
        "SELECT userId FROM auth WHERE token = ?",
        [token]
      );

      if (!verifyUser) {
        logger.warn("Utente non autenticato", { token });
        return res.status(401).json({ message: "Utente non autenticato" });
      } else {
        const result = await db.run("DELETE from contacts WHERE id = ?", [id]);

        if (result.changes && result.changes > 0) {
          logger.info("contatto eliminato con successo", id);
          return res.status(200).json({
            message: "contatto eliminato con successo",
            contactId: id,
          });
        } else {
          logger.warn("contatto non eliminato");
          return res.status(400).json({
            message: "contatto non eliminato",
          });
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Errore JavaScript durante l'aggiunta del contatto", {
          error: err.message,
        });
        return res
          .status(500)
          .json({
            message: "Errore standard di JavaScript",
            error: err.message,
          });
      } else {
        logger.error("Errore sconosciuto durante l'aggiunta del contatto", {
          error: err,
        });
        return res.status(500).json({ message: "Errore sconosciuto" });
      }
    }
  }
);
