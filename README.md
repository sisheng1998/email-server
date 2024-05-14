# Email Server

Powered by Cloudflare Workers and MailChannels

## Environment Variables

### Github Actions

Add these to `Repository secrets` under `Settings` > `Secrets and variables` > `Actions`

- `CLOUDFLARE_API_TOKEN` -> Cloudflare API token which has permissions for Cloudflare Worker
- `CLOUDFLARE_ACCOUNT_ID` -> Your Cloudflare Account ID

Once these are added, the `deploy` Github action workflow will run and deploy the email server on Cloudflare Worker automatically when the `main` branch updated.

### Cloudflare Worker

- `API_TOKEN` - Random token that will be used in the "Authorization" header to make authenticated calls to your email server.
- `DKIM_PRIVATE_KEY` - DKIM private key generated in [DKIM Record](#dkim-record)

For `API_TOKEN`, use `openssl rand -base64 32` command in Linux/MacOS to generate random tokens quickly.

## Setup DNS Records

### SPF Record

Add `TXT` record to your domain with the following values:

| Type | Name | Value                                           |
| ---- | ---- | ----------------------------------------------- |
| TXT  | @    | v=spf1 a mx include:relay.mailchannels.net ~all |

If you already have a SPF record added for your domain, note that you cannot add another `TXT` record for spf. In such cases merge the existing SPF record with mailchannels.

For example, your current SPF record is `v=spf1 include:zoho.in ~all` then append the `include:relay.mailchannels.net` to the same value.

So the new record value will be `v=spf1 include:zoho.in include:relay.mailchannels.net ~all`.

### Domain Lockdown

Add `TXT` record to your domain with the following values:

| Type | Name           | Value                        |
| ---- | -------------- | ---------------------------- |
| TXT  | \_mailchannels | v=mc1 cfid=xxxxx.workers.dev |

Replace `xxxxx` with your workers subdomain which you can find on the `Workers & Pages` section of Cloudflare.

### DKIM Record

Generate private key as PEM file and base64 encoded txt file:

```sh
mkdir -p secrets && openssl genrsa 2048 | tee secrets/private_key.pem | openssl rsa -outform der | openssl base64 -A > secrets/private_key.txt
```

Generate public key for DNS record:

```sh
echo -n "v=DKIM1;p=" > secrets/public_key_record.txt && openssl rsa -in secrets/private_key.pem -pubout -outform der | openssl base64 -A >> secrets/public_key_record.txt
```

You should have `private_key.pem`, `private_key.txt`, and `public_key_record.txt` inside `secrets` folder.

Add `TXT` record to your domain with the following values:

| Type | Name                     | Value                                  |
| ---- | ------------------------ | -------------------------------------- |
| TXT  | mailchannels.\_domainkey | content of the `public_key_record.txt` |

Update [DKIM_PRIVATE_KEY](#cloudflare-worker) with the content of the `private_key.txt` for the environment variables in Cloudflare Worker.

## Usage

Send emails by making a `POST` request to the worker on the `/send` endpoint with the following parameters:

You need to pass an `Authorization` header with the [authorization token](#cloudflare-worker). Like the following: `Authorization: Bearer {API_TOKEN}`

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

## Development

Copy `.dev.vars.example`, rename the new file to `.dev.vars`, and fill in the variables from [Cloudflare Worker](#cloudflare-worker).

Run `npm install` command to install dependencies.

Start a local server with `npm run dev`, the server will run at `http://localhost:8787`.

Note: Email will not be sent with local server as MailChannels only accept the request that sent from Cloudflare workers.

## Technology Stack

- TypeScript
- Hono
- Cloudflare Workers
