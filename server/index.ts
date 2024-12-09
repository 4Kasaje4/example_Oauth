import express from "express";
import db from "./db";
import cors from "cors";
import { v4 as uuidV4 } from "uuid";
import { allScope, grant_type, IAuthorize, IToken, IUser, status } from "./interface";
import { getAuthorization_code, getClientByClientID, getDataScope, getUser } from "./utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// -------------------------------------------- PREPARE CLIENT ------------------------------------------

app.post("/register_client", (_, res) => {
  try {
    const client_id = "77c052ca-9427-48d3-9b18-b88b75f2b15d";
    const client_secret = "a8ca4032-e9b8-4458-ba8b-db3659187934";
    const redirect_uri = "http://localhost:5000/redirect_page";

    // register client ( EXAMPLE )
    db.run(
      "INSERT INTO app(client_id, client_secret, redirect_uri) VALUES(?, ?, ?)",
      [client_id, client_secret, redirect_uri],
      (err) => {
        if (err) {
          res.json({ status: status.error, message: err.message });
          return;
        } else {
          res.json({ status: status.success, message: "register client successfully" });
          return;
        }
      }
    );
  } catch (error) {
    res.status(500).json({ status: status.error, message: "internal server error" });
    console.log(error);
  }
});

// -------------------------------------------- PREPARE USER ------------------------------------------

app.post("/register_user", async (_, res) => {
  try {
    const firstname = "SampleFirstname";
    const lastname = "SampleLastname";
    const username = "SampleUsername";
    const phone = "0999999999";
    const email = "sampleMail@example.com";
    const password = "samplepassword";
    const passwordHash = bcrypt.hashSync(password, 10);
    db.run(
      "INSERT INTO user(user_ID, firstname, lastname, phone, email, username, passwordHash) VALUES(?, ?, ?, ?, ?, ?, ?)",
      [uuidV4(), firstname, lastname, phone, email, username, passwordHash],
      (err) => {
        if (err) {
          res.json({ status: status.error, message: err.message });
          return;
        } else {
          res.json({ status: status.success, message: "register user successfully" });
          return;
        }
      }
    );
  } catch (error) {
    res.status(500).json({ status: status.error, message: "internal server error" });
    console.log(error);
  }
});

// -------------------------------------------- START AUTH SIDE ------------------------------------------

app.post("/login", async (req, res) => {
  try {
    const body = req.body;

    const userData = await getUser(body.username as string);
    const client = await getClientByClientID(body.client_id);

    if (!userData) {
      res.status(200).json({ status: status.error, message: "user not found" });
      return;
    }
    if (!client) {
      res.status(200).json({ status: status.error, message: "client not found" });
      return;
    }

    const passwordIsTrue = bcrypt.compareSync(body.password, userData.passwordHash as string);

    if (!passwordIsTrue) {
      res.status(200).json({ status: status.error, message: "password is not match" });
      return;
    }

    const authorization_code = uuidV4();

    const nowInMilli = Date.now();
    const expires_at = nowInMilli + 1000 * (60 * 10);

    db.run(
      "INSERT INTO authorization_code(authorization_code, user_id, client_id, expires_at) VALUES(?, ?, ?, ?)",
      [authorization_code, userData.user_id, client.client_id, expires_at],
      (err) => {
        if (err) {
          res.status(500).json({ status: status.error, message: "internal server error" });
          return;
        } else {
          res.status(200).json({
            status: status.success,
            redirect_uri: client.redirect_uri,
            code: authorization_code,
            state: body.state,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/login_implicit", async (req, res) => {
  try {
    const body = req.body;

    const userData = await getUser(body.username as string);
    const client = await getClientByClientID(body.client_id);

    console.log(userData);

    if (!userData) {
      res.status(200).json({ status: status.error, message: "user not found" });
      return;
    }
    if (!client) {
      res.status(200).json({ status: status.error, message: "client not found" });
      return;
    }

    const passwordIsTrue = bcrypt.compareSync(body.password, userData.passwordHash as string);

    if (!passwordIsTrue) {
      res.status(200).json({ status: status.error, message: "password is not match" });
      return;
    }

    const payloadAccessToken = {
      type: "access",
      user_id: userData.user_id,
      scope: client.scope,
      grant_type: grant_type.IMPLICIT,
    };

    const access_token = jwt.sign(payloadAccessToken, "sampleSecretAccessToken", { expiresIn: "5h" });

    res.status(200).json({
      status: status.success,
      access_token: access_token,
      redirect_uri: client.redirect_uri,
      state: body.state,
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({ status: status.error, error });
  }
});

// On product use method post
app.get("/authorize_of_authorization_code", async (req, res) => {
  try {
    const query = req.query as unknown as IAuthorize;
    const inputScope = query.scope?.split(",");

    const client = await getClientByClientID(query.client_id);

    if (!inputScope) {
      res.status(400).json({ status: status.error, message: "scope not found" });
      return;
    }

    if (!client) {
      res.status(400).json({ status: status.error, message: "client not found" });
      return;
    }

    if (client?.redirect_uri !== query.redirect_uri) {
      res.status(400).json({ status: status.error, message: "redirect_uri not match" });
      return;
    }

    if (query.response_type !== "code") {
      res.status(400).json({ status: status.error, message: "response_type not match" });
      return;
    }

    for (let i = 0; i < inputScope.length; i++) {
      if (!allScope.includes(inputScope[i])) {
        res.status(400).json({ status: status.error, message: "error at scope" });
        return;
      }
    }

    db.run("UPDATE app SET scope = ? WHERE client_id = ?", [query.scope, client.client_id], (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ status: status.error, message: "internal server error" });
        return;
      } else {
        const redirect_loginPage = `http://localhost:3000/authorization_code?client_id=${client.client_id}&state=${query.state}`;
        res.status(200).redirect(redirect_loginPage);
        return;
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// On product use method post
app.get("/authorize_of_implicit", async (req, res) => {
  try {
    const query = req.query as unknown as IAuthorize;
    const inputScope = query.scope?.split(",");

    const client = await getClientByClientID(query.client_id);

    if (!inputScope) {
      res.status(400).json({ status: status.error, message: "scope not found" });
      return;
    }

    if (!client) {
      res.status(400).json({ status: status.error, message: "client not found" });
      return;
    }

    if (client?.redirect_uri !== query.redirect_uri) {
      res.status(400).json({ status: status.error, message: "redirect_uri not match" });
      return;
    }

    if (query.response_type !== "code") {
      res.status(400).json({ status: status.error, message: "response_type not match" });
      return;
    }
    for (let i = 0; i < inputScope.length; i++) {
      if (!allScope.includes(inputScope[i])) {
        res.status(400).json({ status: status.error, message: "error at scope" });
        return;
      }
    }

    db.run("UPDATE app SET scope = ? WHERE client_id = ?", [query.scope, client.client_id], (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ status: status.error, message: "internal server error" });
        return;
      } else {
        const redirect_loginPage = `http://localhost:3000/implicit?client_id=${client.client_id}&state=${query.state}`;
        res.status(200).redirect(redirect_loginPage);
        return;
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ status: status.error, error });
  }
});

app.post("/token", async (req, res) => {
  try {
    if (req.headers["content-type"] !== "application/x-www-form-urlencoded") {
      res.status(400).json({ status: status.error, messsage: "content-type not application/x-www-form-urlencoded" });
      return;
    }

    const body = req.body;

    // Check body

    if (!body.client_id) {
      res.status(400).json({ status: status.error, message: "client_id not found" });
      return;
    }
    if (!body.client_secret) {
      res.status(400).json({ status: status.error, message: "client_secret not found" });
      return;
    }

    if (body.grant_type === grant_type.AUTHORIZATION_CODE) {
      if (!body.code) {
        res.status(400).json({ status: status.error, meesage: "code not found" });
        return;
      }
      if (!body.redirect_uri) {
        res.status(400).json({ status: status.error, message: "redirect_uri not found" });
        return;
      }

      const client = await getClientByClientID(body.client_id);

      if (!client) {
        res.status(400).json({ status: status.error, message: "client not found" });
        return;
      }
      if (client.client_secret !== body.client_secret) {
        res.status(400).json({ status: status.error, message: "client_secret not match" });
        return;
      }
      if (client.redirect_uri !== body.redirect_uri) {
        res.status(4000).json({ status: status.error, message: "redirect_uri not match" });
        return;
      }
      const auth_code_data = await getAuthorization_code(body.code);

      if (!auth_code_data) {
        res.status(400).json({ status: status.error, message: "authorization_code not match" });
        return;
      }

      const payloadAccessToken = {
        type: "access",
        user_id: auth_code_data.user_id,
        scope: client.scope,
        grant_type: grant_type.AUTHORIZATION_CODE,
      };

      const payloadRefreshToken = {
        type: "refresh_token",
        user_id: auth_code_data.user_id,
        scope: client.scope,
        grant_type: grant_type.AUTHORIZATION_CODE,
      };

      const access_token = jwt.sign(payloadAccessToken, "sampleSecretAccessToken", { expiresIn: "5h" });
      const refresh_token = jwt.sign(payloadRefreshToken, "sampleSecretRefreshToken", { expiresIn: "1d" });

      res.status(200).json({ status: status.success, access_token: access_token, refresh_token: refresh_token });
      return;
    } else if (body.grant_type === grant_type.REFRESH_TOKEN) {
      if (!body.refresh_token) {
        res.status(400).json({ status: status.error, message: "refresh_token not found" });
        return;
      }

      const verifyRefreshToken = jwt.verify(body.refresh_token, "sampleSecretRefreshToken") as IToken;

      if (verifyRefreshToken.type !== grant_type.REFRESH_TOKEN) {
        res.status(400).json({ status: status.error, message: "type is not refresh" });
        return;
      }

      const payloadAccessToken = {
        type: "access",
        user_id: verifyRefreshToken.user_id,
        scope: verifyRefreshToken.scope,
        grant_type: verifyRefreshToken.grant_type,
      };

      const payloadRefreshToken = {
        type: "refresh_token",
        user_id: verifyRefreshToken.user_id,
        scope: verifyRefreshToken.scope,
        grant_type: verifyRefreshToken.grant_type,
      };

      const access_token = jwt.sign(payloadAccessToken, "sampleSecretAccessToken", { expiresIn: "5h" });
      const refresh_token = jwt.sign(payloadRefreshToken, "sampleSecretRefreshToken", { expiresIn: "1d" });

      res.status(200).json({ status: status.success, access_token: access_token, refresh_token: refresh_token });
      return;
    } else if (body.grant_type === grant_type.CLIENT_CREDENTIALS) {
      const clientData = await getClientByClientID(body.client_id);

      if (!clientData) {
        res.status(400).json({ status: status.error, message: "client not found" });
        return;
      }

      if (clientData.client_secret !== body.client_secret) {
        res.status(400).json({ status: status.error, message: "client_secret is not match" });
        return;
      }

      const payloadAccessToken = {
        client_id: clientData.client_id,
        type: "access",
        grant_type: grant_type.CLIENT_CREDENTIALS,
      };

      const access_token = jwt.sign(payloadAccessToken, "sampleSecretAccessToken", { expiresIn: "5h" });

      res.status(200).json({ status: status.success, access_token: access_token });
      return;
    }
  } catch (error) {
    console.log(error);
    res.json({ status: status.error, error });
  }
});

app.post("/api", async (req, res) => {
  try {
    const headers = req.headers;

    const access_token = headers.authorization?.split(" ")[1];

    if (!access_token) {
      res.status(400).json({ status: status.error, message: "access_token not found" });
      return;
    }

    const verifyAccessToken = jwt.verify(access_token, "sampleSecretAccessToken") as IToken;

    if (verifyAccessToken.type !== "access") {
      res.status(400).json({ status: status.error, message: "type is not access" });
      return;
    }

    if (verifyAccessToken.grant_type === grant_type.AUTHORIZATION_CODE) {
      const userData: any = await getDataScope(verifyAccessToken.user_id, verifyAccessToken.scope);

      const scope = verifyAccessToken.scope.split(",");

      const response: Record<string, any> = {};
      scope.forEach((value: any) => {
        response[value] = userData[value];
      });

      res.json({ status: status.success, data: response });
      return;
    } else if (verifyAccessToken.grant_type === grant_type.CLIENT_CREDENTIALS) {
      const clientData = await getClientByClientID(verifyAccessToken.client_id);

      console.log(clientData);

      res.status(200).json({ status: status.success, data: clientData });
      return;
    } else if (verifyAccessToken.grant_type === grant_type.IMPLICIT) {
      const userData: any = await getDataScope(verifyAccessToken.user_id, verifyAccessToken.scope);

      const scope = verifyAccessToken.scope.split(",");

      const response: Record<string, any> = {};
      scope.forEach((value: any) => {
        response[value] = userData[value];
      });

      res.json({ status: status.success, data: response });
      return;
    }
  } catch (error) {
    console.log(error);
    res.json({ status: status.error, error });
  }
});
// -------------------------------------------- END AUTH SIDE --------------------------------------------

app.listen(2003, () => {
  console.log("server is running on port 2003");
});
