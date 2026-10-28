# 🌾 AgriTech - Empowering Farmers Through Digital Technology

> **A full-stack smart farming management platform built with MongoDB, Express.js, React, Node.js, Bootstrap 5, and JWT authentication.**

---

## 📌 Project Overview
AgriTech bridges the gap between traditional agricultural expertise and modern data-driven technology. It equips smallholder and commercial farmers with weather forecasts, automated soil health diagnostics (NPK & pH evaluation), crop lifecycle tracking, early pest outbreak advisories, an agricultural inputs marketplace, and expert consultation through the community forum.

### 🌟 Key Features
- **Role-Based Authentication**: JWT and bcrypt authentication for **Farmers**, **Experts**, and **Admins**. Public registration creates farmer accounts; an administrator promotes users.
- **Farm Profile Management**: CRUD operations for managing acreage, soil types, and irrigation infrastructure.
- **Crop Lifecycle & Phenology Tracker**: Monitor crop progress from Sowing ➔ Harvesting with automated health risk flags.
- **Automated Soil Health & NPK Advisor**: Algorithmic chemical analysis calculating nutrient deficits with instant fertilizer dosage recommendations.
- **Weather & Early Pest Warning**: 5-day forecast from Open-Meteo (requires backend internet access) and broadcast pest/disease alerts.
- **Agricultural Resources Store & Order Tracking**: Seed, fertilizer, and irrigation equipment catalog with order fulfillment tracking.
- **Community Forum & Agronomist Advisory**: Peer-to-peer farmer discussions and verified expert replies.
- **Admin Control Center**: System metrics, user auditing, and emergency alert broadcast system.
- **Multilingual & Responsive UI**: Clean Bootstrap 5 interface supporting English and Hindi (हिंदी).

---

## 🛠️ Tech Stack & Skills Used
| Component | Technologies |
|---|---|
| **Backend** | Node.js, Express.js, Mongoose, JSON Web Token (JWT), bcryptjs, CORS, Dotenv |
| **Frontend** | React 18, Vite 6, React Router 7, Axios, Bootstrap 5, Bootstrap Icons |
| **Database** | MongoDB (Atlas or Local MongoDB) |
| **Tools** | Postman (API Collection included), Git |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or free MongoDB Atlas cluster)

---

### 2. Backend Setup
```powershell
# Navigate to the backend directory
cd backend

# Install dependencies
npm install
```

In PowerShell, from the `backend` directory, run `Copy-Item .env.example .env`. Set `MONGO_URI`, then generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste the result into `JWT_SECRET` in `.env`. Set `FRONTEND_URL` to the frontend origin (comma-separated origins are supported). The API waits for MongoDB before listening and exits with a clear error if configuration or the database connection is unavailable. For a single reverse proxy in production, set `TRUST_PROXY=1`; leave it at `0` for local development.

```powershell
# (Optional, destructive) Replace AgriTech collections with demo data (PowerShell)
# Only do this against a disposable database: it removes existing app records.
$env:SEED_RESET="true"; npm run seed

# Start the backend server
npm start
# Or start in development mode with auto-reload:
npm run dev
```

> The API server will run at: `http://localhost:5000`  
> Health check endpoint: `http://localhost:5000/api/health`

The API and authentication limiters use in-memory counters. This is appropriate for a single local process; production deployments with multiple instances should use a shared rate-limit store. Configure `TRUST_PROXY=1` only when one trusted reverse proxy sits in front of the API.

---

### 3. Frontend Setup
```powershell
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Optional local API base; Vite proxies /api to localhost:5000 by default
Copy-Item .env.example .env

# Start the Vite development server
npm run dev

# Production build
npm run build
```
> The React application will run at: `http://localhost:3000`

The frontend uses a local Vite proxy in development. For a deployed frontend, set `VITE_API_URL` to the hosted backend URL (including `/api`) in the frontend host's environment settings.

Backend automated tests use Node's built-in test runner and do not require MongoDB. From the project folder in PowerShell, run `Set-Location .\backend; npm test`; then run `Set-Location ..\frontend; npm run build`. The registration/login, farm/crop/soil CRUD, order inventory, forum, admin, and activity-log workflows require a running MongoDB and configured backend `.env` to verify end-to-end. No frontend test script is currently defined.

---

## 🔑 Demo Credentials (For Evaluation & Testing)

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Farmer** | `farmer@agritech.com` | `farmer123` | Farm profiles, crop tracker, soil testing, orders, forum |
| **Admin** | `admin@agritech.com` | `admin123` | Admin dashboard, expert/user management, alerts, system metrics |

These accounts are created only when the optional seed is run against a disposable database. The login page's quick-fill buttons only enter the demo credentials; they do not create accounts.

---

## 📬 Postman API Testing
A complete Postman collection is included in:  
📁 `postman/AgriTech_API_Collection.json`

1. Open **Postman**.
2. Click **Import** and select `AgriTech_API_Collection.json`.
3. Set the `baseUrl` variable to `http://localhost:5000/api`.
4. Send **Login** to save its returned token to the collection's `authToken` variable, then test Auth, Farms, Crops, Soil, Weather, Forum, Resources, Orders, and Admin requests. Protected requests require a logged-in user with the appropriate role. End-to-end requests require the API and MongoDB to be running.

The `postman/backend` and `postman/frontend` directories are legacy source snapshots; the live application source is in the top-level `backend` and `frontend` directories. The API collection above is the maintained Postman artifact.

---

## 📂 Project Structure
```
agritech-platform/
├── backend/
│   ├── config/             # MongoDB connection configuration
│   ├── controllers/        # Business logic for all 7 modules
│   ├── middleware/         # JWT auth, role validation & error handlers
│   ├── models/             # Mongoose schemas with relational integrity
│   ├── routes/             # RESTful API route definitions
│   ├── utils/              # Soil recommendation engine & DB seeder
│   ├── .env                # Environment configuration
│   ├── package.json
│   └── server.js           # Express app entrypoint & request logging
├── frontend/
│   ├── public/             # Static assets & HTML template
│   ├── src/
│   │   ├── components/     # Navbar, Footer, WeatherWidget, AlertBanner
│   │   ├── context/        # AuthContext, LanguageContext, CartContext
│   │   ├── pages/          # 10 dedicated full-featured application pages
│   │   ├── services/       # Centralized Axios API client
│   │   ├── utils/          # Multilingual dictionary (English & Hindi)
│   │   ├── App.jsx         # React Router route configuration
│   │   └── main.jsx        # React root bootstrap
│   ├── index.html          # Bootstrap 5 & Google Fonts integration
│   ├── package.json
│   └── vite.config.js      # Vite dev server with /api proxy
├── postman/
│   └── AgriTech_API_Collection.json
└── README.md
```
