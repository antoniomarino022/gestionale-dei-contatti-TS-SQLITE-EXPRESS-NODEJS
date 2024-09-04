import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

let dbPromise: Promise<any>;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: 'mydb.sqlite',
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}
