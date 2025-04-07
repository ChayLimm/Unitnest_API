# UnitNest Backend API

## 🌐 Overview
Node.js backend service for UnitNest - an automated rental room management system featuring:
- Telegram bot integration for tenant communications
- KHQR payment processing (Cambodia's QR standard)
- AI-Based Model meter reading (Flask-YOLO integration)
- Firebase-Firestore sync with Flutter apps

## 🚀 Key Features

### 🤖 Telegram Integration
- Tenant registration & verification
- Payment request handling -> Meter reading photo processing
- Automated reminders from landlord system

### 💰 Payment Processing
- KHQR payment generation
- Transaction status tracking

### 🔌 API Endpoints

| Endpoint       | Method | Description                          | Parameters               |
|----------------|--------|--------------------------------------|--------------------------|
| `/telegram`    | POST   | Telegram webhook handler             | Telegram Update object   |
| `/khqr`        | POST   | Generate KHQR payment (Timeout: 30s) | Payment data             |
| `/khqrstatus`  | POST   | Check payment status (Timeout: 15s)  | `md5` transaction hash   |
| `/aimodel`     | POST   | Process meter readings (OCR)         | Image Url + tenant data  |


## 🛠 Tech Stack

| Component        | Technology                       |
|------------------|----------------------------------|
| Backend          | Node.js + Express.js             |
| Database         | Firebase Firestore               |
| Authentication   | Firebase Admin                   |
| Payment Gateway  | KHQR Standard                    |
| Hosting          | Vercel(Production)/Ngrok(Local)  |
| AI Integration   | Flask + YOLO (Python)            |

## 🚀 Quick Deployment
```bash
# Clone repository
git clone https://github.com/ChayLimm/Unitnest_API.git
cd Unitnest_API

# Install dependencies
npm install

# Start Server , also need to Configure environment (see below)
npm start

## ⚙️ Environment Configuration

### 1. Create Configuration File
Create a new file named `.env` in your project root folder.

### 2. Required Credentials
Copy this template into your `.env` file and replace the placeholder values:

```env
# ━━━━━━━━━━━━━━━━━━━━━━
#      TELEGRAM BOT
# ━━━━━━━━━━━━━━━━━━━━━━
BOT_TOKEN=your_telegram_bot_token
PORT=4040

# ━━━━━━━━━━━━━━━━━━━━━━
#        KHQR PAYMENT
# ━━━━━━━━━━━━━━━━━━━━━━
KHQR_TOKEN=your_jwt_token_from_khqr


# ━━━━━━━━━━━━━━━━━━━━━━
#       FIREBASE ADMIN
# ━━━━━━━━━━━━━━━━━━━━━━
SERVICE_ACCOUNT_TYPE=service_account
SERVICE_ACCOUNT_PROJECT_ID=your_project_id
SERVICE_ACCOUNT_PRIVATE_KEY_ID=your_private_key_id
SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SERVICE_ACCOUNT_CLIENT_EMAIL=your_service_account_email
SERVICE_ACCOUNT_CLIENT_ID=your_client_id
SERVICE_ACCOUNT_AUTH_URI=https://accounts.google.com/o/oauth2/auth
SERVICE_ACCOUNT_TOKEN_URI=https://oauth2.googleapis.com/token
SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
SERVICE_ACCOUNT_CLIENT_X509_CERT_URL=https://www.googleapis.com/...x509/...
SERVICE_ACCOUNT_UNIVERSE_DOMAIN=googleapis.com




