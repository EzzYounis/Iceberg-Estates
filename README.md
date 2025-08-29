"# Iceberg Estates 🏘️

A comprehensive real estate appointment management system built with Vue.js frontend and Node.js backend. This application allows estate agents to manage property viewing appointments with intelligent travel time calculations and schedule optimization.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Dependencies](#dependencies)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Tech Stack](#tech-stack)
- [External Services](#external-services)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🔍 Project Overview

Iceberg Estates is a modern web application designed for estate agents to efficiently manage property viewing appointments. The system automatically calculates travel times between the office and property locations, optimizes agent schedules, and provides a comprehensive dashboard for appointment management.

### Key Business Logic:
- **Smart Scheduling**: Automatically calculates travel times from office to properties
- **Schedule Optimization**:ensures realistic appointment timing
- **Postcode Integration**: Uses UK postcode data for accurate location services
- **Role-based Access**: Secure authentication system for estate agents

## 🏗️ Architecture

This application follows a **3-tier architecture**:

### Frontend (Client)
- **Framework**: Vue.js 3 with Composition API
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite

### Backend (API)
- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

### Database Layer
- **Primary Database**: PostgreSQL
- **ORM**: Sequelize with associations
- **Models**: User, Appointment with relationships

### External Services Integration
- **Postcode API**: UK Postcodes API for location data
- **Routing Service**: OpenRouteService for travel time calculations

## ✨ Features

- 🔐 **User Authentication** - Secure login/registration system
- 📅 **Appointment Management** - Create, view, edit, and delete appointments
- 🗓️ **Schedule View** - Calendar-style appointment overview
- 🚗 **Travel Time Calculation** - Automatic travel time computation
- 📍 **Postcode Validation** - Real-time UK postcode verification
- 📊 **Dashboard** - Quick overview of upcoming appointments
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: v20.19.0 or higher (recommended: v22.12.0+)
- **PostgreSQL**: v12 or higher
- **Git**: Latest version
- **npm**: Comes with Node.js

## �Dependencies

### Backend Dependencies (API)

#### Production Dependencies
```json
{
  "axios": "^1.11.0",           // HTTP client for external API calls
  "bcryptjs": "^3.0.2",         // Password hashing
  "cors": "^2.8.5",             // Cross-Origin Resource Sharing
  "dotenv": "^17.2.1",          // Environment variable management
  "express": "^5.1.0",          // Web framework
  "express-rate-limit": "^8.0.1", // API rate limiting
  "express-validator": "^7.2.1",  // Request validation
  "helmet": "^8.1.0",           // Security headers
  "jsonwebtoken": "^9.0.2",     // JWT authentication
  "moment": "^2.30.1",          // Date/time manipulation
  "pg": "^8.16.3",              // PostgreSQL driver
  "sequelize": "^6.37.7"        // ORM for database operations
}
```

#### Development Dependencies
```json
{
  "jest": "^30.0.5",            // Testing framework
  "nodemon": "^3.1.10",        // Development server auto-restart
  "supertest": "^7.1.4"        // HTTP testing utilities
}
```

### Frontend Dependencies (Client)

#### Production Dependencies
```json
{
  "axios": "^1.11.0",           // HTTP client for API calls
  "date-fns": "^4.1.0",        // Date utility library
  "lucide-vue-next": "^0.542.0", // Icon library
  "pinia": "^3.0.3",           // State management
  "vue": "^3.5.20",            // Vue.js framework
  "vue-router": "^4.5.1"       // Client-side routing
}
```

#### Development Dependencies
```json
{
  "@eslint/js": "^9.34.0",                    // JavaScript linting rules
  "@vitejs/plugin-vue": "^6.0.1",            // Vue.js Vite plugin
  "@vitest/eslint-plugin": "^1.3.4",         // Vitest ESLint integration
  "@vue/eslint-config-prettier": "^10.2.0",   // Prettier ESLint config
  "@vue/test-utils": "^2.4.6",               // Vue testing utilities
  "autoprefixer": "^10.4.21",                // CSS vendor prefixes
  "eslint": "^9.34.0",                       // Code linting
  "eslint-plugin-vue": "^10.3.0",            // Vue-specific ESLint rules
  "globals": "^16.3.0",                      // Global variables for ESLint
  "jsdom": "^26.1.0",                        // DOM simulation for testing
  "postcss": "^8.5.6",                       // CSS post-processor
  "prettier": "^3.6.2",                      // Code formatting
  "tailwindcss": "^3.4.17",                  // CSS framework
  "vite": "^7.1.3",                          // Build tool and dev server
  "vite-plugin-vue-devtools": "^8.0.1",      // Vue devtools integration
  "vitest": "^3.2.4"                         // Testing framework
}
```


## �🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/EzzYounis/Iceberg-Estates.git
cd Iceberg-Estates
```

### 2. Database Setup

First, create a PostgreSQL database:

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE iceberg_estates;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE iceberg_estates TO postgres;
```

### 3. Backend Setup

Navigate to the API directory and install dependencies:

```bash
cd api
npm install
```

### 4. Frontend Setup

Navigate to the client directory and install dependencies:

```bash
cd ../client
npm install
```

## 🔐 Environment Variables

### Backend Environment Variables

Create a `.env` file in the `api` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iceberg_estates
DB_USER=postgres
DB_PASSWORD=your_database_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# External API Keys
OPENROUTE_API_KEY=your_openroute_api_key_here

# Business Configuration
OFFICE_POSTCODE=CM2 7PJ
```



#### How to Get API Keys:

1. **OpenRouteService API Key** (Optional but recommended):
   - Visit [openrouteservice.org](https://openrouteservice.org/)
   - Sign up for a free account
   - Navigate to Dashboard → Tokens
   - Create a new token and copy the API key

### Frontend Configuration

The frontend automatically connects to `http://localhost:3000` for the backend API. No environment variables are needed for basic operation.

## 🏃‍♂️ Running the Application

### Development Mode

You'll need **3 terminal windows** to run the full application:

#### Terminal 1: Start the Database
Make sure PostgreSQL is running on your system:

```bash
# On Windows (if PostgreSQL is installed as a service)
net start postgresql

# On macOS with Homebrew
brew services start postgresql

# On Linux
sudo systemctl start postgresql
```

#### Terminal 2: Start the Backend Server

```bash
cd api
npm run dev
```

The API server will start on `http://localhost:3000`

#### Terminal 3: Start the Frontend Development Server

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`

### Production Mode

#### Backend Production:
```bash
cd api
npm start
```

#### Frontend Production Build:
```bash
cd client
npm run build
npm run preview
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new agent | `{ name, email, password }` |
| POST | `/api/auth/login` | Login agent | `{ email, password }` |
| GET | `/api/auth/profile` | Get current agent profile | Bearer token required |

### Appointment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/appointments` | Get all appointments | Yes |
| POST | `/api/appointments` | Create appointment | Yes |
| GET | `/api/appointments/:id` | Get specific appointment | Yes |
| PUT | `/api/appointments/:id` | Update appointment | Yes |
| DELETE | `/api/appointments/:id` | Delete appointment | Yes |
| GET | `/api/appointments/schedule/:date` | Get appointments for specific date | Yes |

### Agent Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/agents` | Get all agents | Yes |

## 🛠️ Tech Stack

### Frontend Technologies
- **Vue.js 3**: Progressive JavaScript framework
- **Pinia**: State management library
- **Vue Router 4**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client library
- **Lucide Vue**: Icon library
- **Date-fns**: Date utility library
- **Vite**: Build tool and development server

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database
- **Sequelize**: Object-relational mapping (ORM)
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Express Rate Limit**: Rate limiting middleware

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Testing framework
- **Nodemon**: Development server auto-restart
- **Jest**: Backend testing
- **Supertest**: HTTP testing

## 🌐 External Services

### UK Postcodes API
- **URL**: `https://api.postcodes.io`
- **Purpose**: Validates UK postcodes and retrieves coordinates
- **Cost**: Free
- **Rate Limits**: 1000 requests per minute

### OpenRouteService API
- **URL**: `https://api.openrouteservice.org`
- **Purpose**: Calculates driving routes and travel times
- **Authentication**: API key required
- **Free Tier**: 2000 requests per day
- **Signup**: [openrouteservice.org](https://openrouteservice.org)

## 💻 Development

### Code Structure

```
Iceberg_Estates/
├── api/                          # Backend application
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Custom middleware
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   └── services/            # Business logic
│   └── package.json
├── client/                       # Frontend application
│   ├── src/
│   │   ├── components/          # Vue components
│   │   ├── stores/              # Pinia stores
│   │   ├── router/              # Vue Router config
│   │   └── config/              # Frontend config
│   └── package.json
└── README.md
```

### Development Commands

#### Backend Commands:
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

#### Frontend Commands:
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm test:unit      # Run unit tests
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## 🧪 Testing

### Backend Testing
```bash
cd api
npm test
```

### Frontend Testing
```bash
cd client
npm run test:unit
```



**Built by Ezzaldeen Younis**

