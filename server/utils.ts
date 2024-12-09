import { app, IAuthorization_code, IUser } from "./interface";
import db from "./db";

export function getClientByClientID(client_id: string): Promise<app | null> {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM app WHERE client_id = ?", [client_id], (err, result) => {
      if (err) {
        console.log(err);
        reject(new Error("error in function getClientByClientID"));
      } else {
        const response = result[0] as app;
        if (!response) resolve(null);
        resolve(response);
      }
    });
  });
}

export function getUser(username: string): Promise<IUser | null> {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM user WHERE username = ?", [username], (err, result) => {
      if (err) {
        reject(new Error("error at getUser"));
        console.log(err);
      } else {
        const userData = result[0] as IUser;
        if (!userData) resolve(null);
        resolve(userData);
      }
    });
  });
}

export function getAuthorization_code(code: string): Promise<IAuthorization_code | null> {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM authorization_code WHERE authorization_code = ?", [code], (err, result) => {
      if (err) {
        reject(new Error("error at getAuthorization_code"));
        console.log(err);
      } else {
        const response = result[0] as IAuthorization_code;

        if (!response) {
          resolve(null);
        } else {
          resolve(response);
        }
      }
    });
  });
}

export function getDataScope(user_id: string, fields: string): Promise<IUser> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT ${fields} FROM user WHERE user_id = ?`, [user_id], (err, result) => {
      if (err) {
        console.log(err);
        reject(new Error("error at getDataScope"));
      } else {
        const userData = result[0] as IUser;

        resolve(userData);
      }
    });
  });
}
