# WhatsApp Bot (Pharmacy)

Node.js + Express bot using **WhatsApp Cloud API**.

## Env variables
Create them in your hosting dashboard:
- `WHATSAPP_TOKEN` – Permanent token from Meta
- `VERIFY_TOKEN` – any string, but use the same in Meta Webhook config
- `PHONE_NUMBER_ID` – WhatsApp Business phone number ID

## Endpoints
- `GET /webhook` – used by Meta for verification
- `POST /webhook` – receives messages
