# 🌾 AgriTech - Empowering Farmers Through Digital Technology

> **A full-stack smart farming management platform built with the MERN Stack (MongoDB, Express.js, React.js, Node.js), Bootstrap 5, and JWT Authentication.**

---

## 📌 Project Overview
AgriTech bridges the gap between traditional agricultural expertise and modern data-driven technology. It equips smallholder and commercial farmers with real-time weather forecasts, automated soil health diagnostics (NPK & pH evaluation), crop lifecycle tracking, early pest outbreak advisories, an agricultural inputs marketplace, and direct expert consultation.

### 🌟 Key Features
- **Role-Based Authentication**: Secure JWT & bcrypt authentication for **Farmers** and **Admins**.
- **Farm Profile Management**: CRUD operations for managing acreage, soil types, and irrigation infrastructure.
- **Crop Lifecycle & Phenology Tracker**: Monitor crop progress from Sowing ➔ Harvesting with automated health risk flags.
- **Automated Soil Health & NPK Advisor**: Algorithmic chemical analysis calculating nutrient deficits with instant fertilizer dosage recommendations.
- **Microclimate Weather & Early Pest Warning**: 5-day weather forecasting and broadcasted pest/disease early warnings with actionable remedies.
- **Agricultural Resources Store & Order Tracking**: Seed, fertilizer, and irrigation equipment catalog with order fulfillment tracking.
- **Community Forum & Agronomist Advisory**: Peer-to-peer farmer discussions and verified expert replies.
- **Admin Control Center**: System metrics, user auditing, and emergency alert broadcast system.
- **Multilingual & Responsive UI**: Clean Bootstrap 5 interface supporting English and Hindi (हिंदी).

---

## 🛠️ Tech Stack & Skills Used
| Component | Technologies |
|---|---|
| **Backend** | Node.js, Express.js, Mongoose, JSON Web Token (JWT), bcryptjs, CORS, Dotenv |
| **Frontend** | React 18, Vite, React Router v6, Axios, Bootstrap 5, Bootstrap Icons |
| **Database** | MongoDB (Atlas or Local MongoDB) |
| **Tools** | Postman (API Collection included), Git |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance or free MongoDB Atlas cluster)

---

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# (Optional) Seed the database with realistic demo data
npm run seed

# Start the backend server
npm start
# Or start in development mode with auto-reload:
npm run dev
```
> The API server will run at: `http://localhost:5000`  
> Health check endpoint: `http://localhost:5000/api/health`

---

### 3. Frontend Setup
```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
> The React application will run at: `http://localhost:3000`

---

## 🔑 Demo Credentials (For Evaluation & Testing)

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Farmer** | `farmer@agritech.com` | `farmer123` | Farm profiles, crop tracker, soil testing, orders, forum |
| **Admin & Agronomist** | `admin@agritech.com` | `admin123` | Admin dashboard, pest alert broadcasting, system metrics |

*(Note: The login page also features **1-Click Quick Fill** buttons for immediate testing!)*

---

## 📬 Postman API Testing
A complete Postman collection is included in:  
📁 `postman/AgriTech_API_Collection.json`

1. Open **Postman**.
2. Click **Import** and select `AgriTech_API_Collection.json`.
3. Set the `baseUrl` variable to `http://localhost:5000/api`.
4. Test endpoints for Auth, Farms, Crops, Soil, Weather, and Orders.

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
│   │   ├── services/       # Centralized Axios API client with mock fallbacks
│   │   ├── utils/          # Multilingual dictionary (English & Hindi)
│   │   ├── App.jsx         # React Router v6 route configuration
│   │   └── main.jsx        # React root bootstrap
│   ├── index.html          # Bootstrap 5 & Google Fonts integration
│   ├── package.json
│   └── vite.config.js      # Vite dev server with /api proxy
├── postman/
│   └── AgriTech_API_Collection.json
└── README.md
```
