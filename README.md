# UnitNest API

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
# Fill in your environment variables