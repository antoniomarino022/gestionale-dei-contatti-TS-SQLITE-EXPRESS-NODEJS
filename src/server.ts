import express from 'express';
import { config } from 'dotenv';
import { routerUser } from './router/usersRouter';
import { routerAuth } from './router/authRouter';
import { routerContact } from './router/contactRouter';
import { getDb } from './db';

config();

const port = process.env.PORT || '3000';
const app = express();

// Middleware per parsare i dati JSON
app.use(express.json());

// Middleware per loggare il corpo grezzo
app.use((req, res, next) => {
  console.log('Corpo Grezzo:', req.body);
  next();
});

// Funzione per inizializzare il database
async function initializeDatabase() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      Token TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      contactName TEXT NOT NULL,
      contactEmail TEXT,
      number TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

initializeDatabase();

app.use('/user', routerUser);
app.use('/auth', routerAuth);
app.use('/contact', routerContact);

app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
