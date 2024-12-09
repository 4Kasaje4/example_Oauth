# Oauth

## Grant type

- Authorization code
- Client credentials

- Client Side

  - port 3000

  - Command

    ```
    npm install
    npm run dev-client
    ```

- Server Side
  - port 2003
  - Command
    ```
    npm install
    npm run dev-server
    ```

## Register Client

### Endpoint

```
method: POST

http://localhost:2003/register_client
```

### Response

```
{
    "status": "SUCCESS",
    "message": "register client successfully"
}
```

You can edit in `index.ts` file

```
    const client_id = YOUR_CLIENT_ID
    const client_secret = YOUR_CLIENT_SECRET
    const redirect_uri = YOUR_REDIRECT_URI
```

## Register_user

### Endpoint

```
method: POST

http://localhost:2003/register_user
```

### Response

```
{
    "status": "SUCCESS",
    "message": "register user successfully"
}
```

You can edit in `index.ts` file

```
    const firstname = YOUR_FIRSTNAME;
    const lastname = YOUR_LASTNAME;
    const username = YOUR_USERNAME;
    const phone = YOUR_PHONE;
    const email = YOUR_EMAIL;
    const password = YOUR_PASSWORD
```

# Grant Type

# Authorization code

## 1. Authorize user

### Endpoint

```
method : GET

http://localhost:2003/authorize
```

### Parameters

- client_id
- response_type = code
- redirect_uri
- scope
- state

Scope

- username
- email
- firstname
- lastname
- phone

You can edit scope in `interface.ts`

### Resposne

```
{redirect_uri}?code={authorization_code}&state={YOUR_STATE}
```

## 2. Request token

### Endpoint

```
method : POST
content-type : application/x-www-form-urlencoded

http://localhost:2003/token
```

### Body

- grant_type = authorization_code
- client_id
- client_secret
- code
- redirect_uri

### Response

```
{
    "status": "SUCCESS",
    "access_token": "eyJhbGciO...d2A7qzyayz2I_0",
    "refresh_token": "eyJhbGciOiJ...NTPDpk2mMTE"
}
```

## 3. Get data

### Endpoint

```
method : POST
content-type : application/x-www-form-urlencoded
headers : authorization : Bearer YOUR_ACCESS_TOKEN

http://localhost:2003/api
```

### Response

```
{
    "status": "SUCCESS",
    "data": {
        "email": "sampleMail@example.com",
        "username": "SampleUsername"
    }
}
```

# Grant Type

# Refresh token

### Endpoint

```
method : POST
content-type : application/x-www-form-urlencoded

http://localhost:2003/token
```

### Parameters

- grant_type = refresh_token
- client_id
- client_secret
- refresh_token

### Response

```
{
    "status": "SUCCESS",
    "access_token": "eyJhbGciOiJI...6QBMWw57J5s",
    "refresh_token": "eyJhb...vy33mxAxgE"
}
```

# Grant Type

# Client credentials

### Endpoint

```
method: POST
content-type : application/x-www-form-urlencoded

http://localhost:2003/token
```

### Parameters

- grant_type = client_credentials
- client_id
- client_secret

### Response

```
{
    "status": "SUCCESS",
    "access_token": "eyJhbGciOiJI..._m7ipRVkQg"
}
```
