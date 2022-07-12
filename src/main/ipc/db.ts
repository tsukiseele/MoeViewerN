import { app, ipcMain } from 'electron'
import { resolve } from 'path';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(resolve(process.cwd(), 'download.db')); //:memory:

ipcMain.handle('initSQLite', async (event, text): Promise<boolean> => {
  db.serialize(() => {
      // db.run("CREATE TABLE lorem (info TEXT)");
  
      const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
      for (let i = 0; i < 10; i++) {
          stmt.run("Ipsum " + i);
      }
      stmt.finalize();
  
      db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
          console.log(row.id + ": " + row.info);
      });
  });
  
  // db.close();
  return true
})
