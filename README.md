# Email Server

Send & verify email with NodeJS.

## Usage - Send Email

Send email by making a `POST` request to the server on the `/send` endpoint with the following parameters:

You need to pass an `Authorization` header with the [authorization token](#environment-variables). Like the following: `Authorization: Bearer {API_TOKEN}`

### Basic Email

The most basic request would look like this:

```json
{
  "to": "john@example.com",
  "from": "me@example.com",
  "subject": "Hello World",
  "text": "Hello World"
}
```

### HTML Email

You can also send HTML emails by adding an `html` parameter to the request. This can be used in conjunction with the `text` parameter to send a multi-part email.

```json
{
  "to": "john@example.com",
  "from": "me@example.com",
  "subject": "Hello World",
  "html": "<h1>Hello World</h1>"
}
```

### Sender and Recipient Name

You can also specify a sender and recipient name by adding a `name` parameter to the request. This can be used for both the `to` and `from` parameters.

```json
{
  "to": { "email": "john@example.com", "name": "John Doe" },
  "from": { "email": "me@example.com", "name": "Jane Doe" },
  "subject": "Hello World",
  "text": "Hello World"
}
```

### Sending to Multiple Recipients

You may also send to multiple recipients by passing an array of emails, or an array of objects with `email` and `name` properties.

```json
{
  "to": ["john@example.com", "rose@example.com"],
  "from": "me@example.com",
  "subject": "Hello World",
  "text": "Hello World"
}
```

or

```json
{
  "to": [
    { "email": "john@example.com", "name": "John Doe" },
    { "email": "rose@example.com", "name": "Rose Doe" }
  ],
  "from": "me@example.com",
  "subject": "Hello World",
  "text": "Hello World"
}
```

### Sending BCC and CC

You can also send BCC and CC emails by passing an array of emails, an object with `email` and `name` properties, or an array of either, similar to the `to` parameter.

```json
{
  "to": "john@example.com",
  "from": "me@example.com",
  "subject": "Hello World",
  "text": "Hello World",
  "cc": ["jim@example.com", "rose@example.com"],
  "bcc": ["gil@example.com"]
}
```

### Reply To

You can also specify a reply to email address by adding a `replyTo` parameter to the request. Again, you can use an email string, an object with `email` and `name` properties, or an array of either.

```json
{
  "to": "john@example.com",
  "from": "me@example.com",
  "replyTo": "support@example.com",
  "subject": "Hello World",
  "text": "Hello World"
}
```

### Dry Run

To test the function without sending the email, add `dryRun` parameter to the request.

```json
{
  "to": "john@example.com",
  "from": "me@example.com",
  "subject": "Hello World",
  "text": "Hello World",
  "dryRun": true
}
```

When the `dryRun` is present and set to `true`, the email will not be sent.

### Email Headers

For custom email headers, add `headers` parameter to the request.

```json
{
  "headers": {
    "X-My-Key": "header value",
    "X-Another-Key": "another value"
  },
  "to": "john@example.com",
  "from": "me@example.com",
  "subject": "Hello World",
  "text": "Hello World"
}
```

## Usage - Verify Email

Verify email by making a `POST` request to the server on the `/verify` endpoint with the following parameters:

You need to pass an `Authorization` header with the [authorization token](#environment-variables). Like the following: `Authorization: Bearer {API_TOKEN}`

### Request

The request should look like this:

```json
{
  "email": "john@example.com"
}
```

### Response

If everything is correct, the response should look like this:

```json
{
  "success": true,
  "result": {
    "email": "john@example.com",
    "isEmailValid": true,
    "isDisposable": false,
    "isMxRecordFound": true,
    "isSMTPConnected": true,
    "isEmailExist": true,
    "isCatchAll": true
  }
}
```

### Result

- `email` - email that you send in request body.
- `isEmailValid` - check if the format of the email is valid.
- `isDisposable` - check if the email is disposable / temporary.
- `isMxRecordFound` - check if the email has at least 1 mail exchange (MX) record.
- `isSMTPConnected` - check if the SMTP server can be connected.
- `isEmailExist` - check if the email exists.
- `isCatchAll` - check if the email is catch-all.

For `isSMTPConnected`, some server might block port 25, thus the server will be timeout in 3 seconds and return as `false`.

## Environment Variables

- `API_TOKEN` - Random token that will be used in the "Authorization" header to make authenticated calls to your email server.
- `SMTP_HOST` - The hostname or IP address of the SMTP server.
- `SMTP_USERNAME` - The username for authenticating with the SMTP server.
- `SMTP_PASSWORD` - The password for authenticating with the SMTP server.

For `API_TOKEN`, use `openssl rand -base64 32` command in Linux/MacOS to generate random tokens.

## Development

Copy `.env.example`, rename the new file to `.env`, and fill in the variables from [Environment Variables](#environment-variables).

Run `npm install` command to install dependencies.

Start a local server with `npm run dev`, the server will run at `http://localhost:8787`.

### Disposable Email Blocklist

To update the disposable email blocklist, add new domain(s) in `disposable_email_blocklist.conf` under `/scripts` folder.

Run `npm run populate:disposable-email` command, `disposableEmailList.ts` under `/src/constants` folder will be updated.

## Deployment

Run `npm run build` command, all TypeScript files under `/src` folder will build into JavaScript files under `/dist` folder.

Start a local server with `npm run start`, the server will run at `http://localhost:8787` using `/dist/index.js` as entry point.

### Debug

Error `ERR_REQUIRE_ESM` might appear if the NodeJS server under CommonJS environment.

To fix the error, use `app.cjs` file as entry point to run the server, it should be under `/dist` folder after `npm run build`.

## Technology Stack

- TypeScript
- Hono
- NodeJS
