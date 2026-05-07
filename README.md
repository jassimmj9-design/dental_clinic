# 🦷 Dental Clinic Management System

A modern, full-stack web application designed for professional dental clinic management. This application features a clean medical UI, role-based access control, and comprehensive patient, appointment, and billing tracking.

---

## 🌟 Key Features

- **Dashboard**: High-level overview of total patients, today's appointments, revenue, and pending invoices.
- **Patient Management**: Complete CRUD operations, search functionality, and detailed profile views.
- **Appointment Scheduling**: Interactive calendar with day/week/month views for easy scheduling.
- **Treatment Tracking**: Maintain detailed medical history, procedure notes, and cost tracking for each patient.
- **Billing System**: Simplified invoicing and payment status management (Paid, Partial, Unpaid).
- **Authentication**: Secure JWT-based login with role-based access for Admin, Dentist, and Assistant.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop screens.

---

## 🛠️ Technical Stack

- **Frontend**: React 19 (Vite), Tailwind CSS 4, React Router 7, Lucide Icons, React Big Calendar, Recharts.
- **Backend**: Node.js, Express, Sequelize ORM.
- **Database**: MySQL.
- **Auth**: JWT (JSON Web Tokens) with bcrypt password hashing.

---

## 🏗️ Project Structure

```text
dental-clinic/
├── backend/            # Express REST API
│   ├── src/
│   │   ├── config/      # Database connection setup
│   │   ├── controllers/ # Request handlers (Business logic)
│   │   ├── middleware/  # Auth & Role-based guards
│   │   ├── models/      # Sequelize model definitions
│   │   ├── routes/      # API endpoint routing
│   │   ├── scripts/     # DB initialization scripts
│   │   └── seeders/     # Mock data seeding
│   └── app.js           # Express application entry
└── frontend/           # React Single Page Application
    ├── src/
    │   ├── components/  # Layout, UI components, Form elements
    │   ├── context/     # Global Authentication State
    │   ├── pages/       # Route-level components (Dashboard, Patients, etc.)
    │   ├── services/    # Axios API configurations
    │   └── utils/       # Helper functions and formatters
    └── tailwind.config.js
```

---

## 🚀 Setup & Installation

### 1. Database Setup
Ensure your MySQL server is running locally on the default port (3306). 

From the **`backend/`** directory, run:
```powershell
# Create the database
node src/scripts/create-db.js

# Sync models and seed with Arabic/French dummy data
node src/seeders/seed.js
```

### 2. Backend Installation
Navigate to **`backend/`** and run:
```powershell
npm install
npm run dev
```
*API will be available at `http://localhost:5000`.*

### 3. Frontend Installation
Navigate to **`frontend/`** and run:
```powershell
npm install
npm run dev
```
*App will be available at `http://localhost:5173`.*

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Dentist** | `karim@clinic.com` | `dentist123` |
| **Assistant** | `assistant@cliniccom` | `assistant123` |

---

## 📝 Commands Used in This Project

During development, the following commands were executed to scaffold and configure the environment:

### Global/Setup
- `mkdir backend`, `mkdir frontend`: Directory structure creation.
- `mysql -u root -e "CREATE DATABASE IF NOT EXISTS dental_clinic;"`: Database creation (fallback check).

### Backend
- `npm init -y`: Initialize Node.js project.
- `npm install express cors dotenv sequelize mysql2 bcryptjs jsonwebtoken`: Core dependencies.
- `npm install -D nodemon`: Development utility.
- `node src/scripts/create-db.js`: Custom DB creation script.
- `node src/seeders/seed.js`: Database seeding script.

### Frontend
- `npx create-vite@latest frontend --template react`: Scaffolding the React app.
- `npm install axios react-router-dom react-big-calendar recharts date-fns lucide-react react-hot-toast`: UI and logical dependencies.
- `npm install -D tailwindcss postcss autoprefixer`: Styling engine.
- `npx tailwindcss init -p`: Tailwind configuration.
- `npm install vite@6 @vitejs/plugin-react@4 --save-dev`: Version alignment for stability.

---

## 📄 License
This project is for demonstration purposes as part of a junior full-stack developer portfolio.
