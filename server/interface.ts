export type app = {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  authorization_code: string;
  scope: string;
};

export const status = {
  success: "SUCCESS",
  error: "ERROR",
};

export const grant_type = {
  AUTHORIZATION_CODE: "authorization_code",
  REFRESH_TOKEN: "refresh_token",
  CLIENT_CREDENTIALS: "client_credentials",
  IMPLICIT: "implicit",
};

export interface IAuthorize {
  client_id: string;
  redirect_uri?: string;
  state?: string;
  response_type?: string;
  scope?: string;
}

export interface IToken {
  grant_type: string;
  client_id: string;
  client_secret: string;
  code: string;
  redirect_uri: string;
}

export interface IAuthorization_code {
  authorizarion_code: string;
  user_id: string;
  client_id: string;
  expires_at: string;
}

export interface IUser {
  user_id: string;
  firstnane?: string;
  lastname: string;
  phone?: string;
  username?: string;
  email?: string;
  passwordHash?: string;
}

export interface IToken {
  type: string;
  user_id: string;
  scope: string;
}

export const allScope = ["username", "email", "phone", "firstname", "lastname"];
