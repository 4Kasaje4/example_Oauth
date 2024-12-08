import sqlite3 from "sqlite3";

const db = new sqlite3.Database("db.sqlite");

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS app(client_id TEXT PRIMARY KEY NOT NULL, client_secret TEXT, redirect_uri TEXT, scope TEXT)`
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS user(user_id TEXT PRIMARY KEY NOT NULL, firstname TEXT, lastname TEXT, phone TEXT, email TEXT, username TEXT, passwordHash TEXT)"
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS authorization_code(authorization_code TEXT, user_id TEXT, client_id TEXT, expires_at TEXT)`
  );
});

export default db;
