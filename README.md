<!-- # UnitNest API

## Overview
UnitNest API is a Node.js backend service with HTTP AI model integration, designed for:
- Real-time communication with AI models
- Payment processing with timeout handling
- System notifications and tenant management
- Telegram bot integration

## Technical Stack
- **Runtime**: Node.js
- **Hosting**: Vercel
- **AI Integration**: HTTP API connections
- **Payment Processing**: KHQR standard
- **Configuration**: 
  - `vercel.json` for deployment settings
  - `package.json` with debug timeouts

## API Endpoints

### Core Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/telegram` | POST | Telegram bot webhook |
| `/aimodel` | POST | AI model integration |

### Payment Endpoints
| Endpoint | Method | Description | Timeout |
|----------|--------|-------------|---------|
| `/khqr` | POST | Process KHQR payments | 30s |
| `/khqrstatus` | POST | Check payment status | 15s |

## Setup Instructions

### 1. Environment Configuration
```bash
cp .env.example .env
# Fill in your environment variables -->



<!-- # UnitNest API

## Overview
UnitNest API is a Node.js backend service with:
- Firebase integration for data storage
- Telegram bot webhook handling
- AI model processing endpoints
- KHQR payment processing
- Tenant management system

## Features
- **Real-time Notifications**: Firebase-powered notification system
- **Tenant Verification**: Check registration status via chat ID
- **Payment Processing**: KHQR payment integration with status tracking
- **Rule Management**: Fetch landlord rules dynamically
- **Contact System**: Retrieve landlord contact information
- **AI Integration**: Process and store AI model responses

## Technical Stack
- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Admin + JWT
- **Hosting**: Vercel
- **Integrations**:
  - Telegram Bot API
  - KHQR Payment System
  - Custom AI Models

## API Endpoints

### Core Services
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/test` | GET | Health check |
| `/testAPI` | POST | Testing endpoint |
| `/telegram` | POST | Telegram webhook handler |

### Payment Services
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/khqr` | POST | Process KHQR payment | Payment data |
| `/khqrstatus` | POST | Check payment status | `md5` (required) |

### AI Integration
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/aimodel` | POST | Process AI model responses |

## Firebase Integration

### Configuration
```javascript
{
  type: process.env.SERVICE_ACCOUNT_TYPE,
  project_id: process.env.SERVICE_ACCOUNT_PROJECT_ID,
  private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL
  // ...other config
} -->


# UnitNest API

## 📌 Overview
UnitNest API is a robust Node.js backend service that handles:
- Telegram bot communication 
- Flutter mobile applications support with send remind to tenant via 
- AI model integration 
- Payment processing 

Built with Express.js and deployed on Vercel, this API serves as the central hub for your UnitNest ecosystem.

## 🌟 Key Features

### 🤖 Telegram Bot Integration
- Real-time message processing via webhook
- Tenant registration then comfirmation from landlord flutter app
- Notification management system: registeration notify and make payment request (send water&electricty meter) to flutter app by sync those notify to firebase -> then system refresh will see those new notify 

### 📱 Flutter App Backend Support
- Dedicated API endpoints for:
  - Payment processing
  - Notification updates

### 💰 Payment Processing
- KHQR payment gateway integration
- Transaction status tracking

### 🧠 AI Model Integration
- HTTP endpoint for model Processing 


## 🛠 Technical Stack

| Component               | Technology                          |
|-------------------------|-------------------------------------|
| Backend Framework       | Express.js                          |
| Database                | Firebase Firestore                  |
| Authentication          | Firebase Admin                      |
| Hosting Platform        | Vercel                              |
| Payment Gateway         | KHQR Standard                       |
| Environment Management  | dotenv                              |

## 🔌 API Endpoints

### Core Endpoints
| Endpoint       | Method | Description                          | Parameters               |
|----------------|--------|--------------------------------------|--------------------------|
| `/telegram`    | POST   | Telegram bot webhook processor       | Telegram Update object   |

### Payment Endpoints
| Endpoint         | Method | Description                     | Requirements              |
|------------------|--------|---------------------------------|---------------------------|
| `/khqr`          | POST   | Process KHQR payments           | Payment data object       |
| `/khqrstatus`    | POST   | Check payment status            | `md5` transaction hash    |

### AI Integration
| Endpoint       | Method | Description                          |
|----------------|--------|--------------------------------------|
| `/aimodel`     | POST   | Process AI-Based model predictions         |

## 🔥 Firebase Integration
