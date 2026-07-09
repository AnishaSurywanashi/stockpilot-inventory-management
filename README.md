# 🛰️ StockPilot — Enterprise Warehouse & Inventory Telemetry Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-JSON%20Web%20Token-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

StockPilot is a high-fidelity, production-grade warehouse inventory control dashboard built for enterprise-level inventory management. The platform incorporates automated reorder alert systems, secure role-based access, atomic warehouse-to-warehouse stock transfers with optimistic locking, and dynamic real-time telemetry dashboards.

Created with high-end, responsive aesthetics using a **glassmorphic space theme** and featuring robust transactional backend services.

---

## 🌟 Architecture & Key Features

*   **Layered Security Architecture:** Secured REST API endpoints using stateless JSON Web Token (JWT) authorization, providing strict Role-Based Access Control (RBAC) separated into `ADMIN` and `STAFF` permissions.
*   **Optimistic Concurrency Control:** System uses `@Version` fields on database entities to enforce optimistic locking, preventing race conditions or stock double-allocation during concurrent transactions.
*   **Atomic Multi-Item Stock Transfers:** Fully transactional stock moves between physical depots with full rollback safety in the event of threshold breaches or downstream system issues.
*   **Real-Time Data Telemetry:** A state-of-the-art telemetry board built using React 18, Tailwind CSS v4, Recharts, and Lucide Icons tracking sales velocity, capacity metrics, and stock limits.
*   **Seeded Demo Data On Startup:** Startup seeder class initializes database schemas with operational mock users, products, suppliers, and depot warehouses.

---

## 📁 Repository Directory Structure

```text
StockPilot_Project/
├── backend/                       # Spring Boot 3 Java Maven Backend
│   ├── src/main/java/             # Core JPA Entity, Services, and REST Controllers
│   ├── src/main/resources/        # application.yml Configuration
│   └── pom.xml                    # Maven Dependency Build File
├── frontend/                      # React 18 + Vite + Tailwind v4 + Lucide Icons
│   ├── src/                       # React Component Modules, State, and API Interceptors
│   ├── index.html                 # Main App Document Entrypoint
│   └── vite.config.js             # Vite Dev Server Configuration
├── .gitignore                     # Repository Version Control Exclusions
└── README.md                      # Setup and Telemetry Audit Documentation
```

---

## 🛠️ Step-by-Step Local Deployment

### 1. Database Setup (MySQL)
1. Ensure your local MySQL server is started (`port: 3306`).
2. The application is configured to connect to database schema `stockpilot` (it will auto-create if it does not exist) using the following credentials:
   *   **Username:** `root`
   *   **Password:** `MYSQLA@99`
     *(These configurations can be modified in `backend/src/main/resources/application.yml`)*

### 2. Startup Backend Server (Spring Boot)
Open a terminal in the `backend/` directory and execute:
```bash
mvn clean spring-boot:run
```
On startup, `DataInitializer` seeds baseline demonstration mock data (e.g. system operators, warehouses, product catalog entries, and suppliers).

### 3. Startup Frontend Dashboard (React + Vite)
Open a separate terminal in the `frontend/` directory and run:
```bash
npm install
npm run dev
```
Open your browser and navigate to **`http://localhost:5173/`**.

---

## 🔑 Credentials Checklist

Use the seeded profiles below to test role-based capabilities:

| Identity | Username | Password | Assigned Role | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | `ADMIN` | Full access (Warehouse registration, catalog modifications, supply management, stock transfers) |
| **Logistics Staff** | `staff` | `staff123` | `STAFF` | Operations access (Review allocations, request stock locks/reservations, view charts) |

---

## 🚀 API Endpoints Overview

### **Authentication**
*   `POST /api/auth/register` — Register a new account.
*   `POST /api/auth/login` — Login to retrieve bearer JWT token.

### **Inventory**
*   `GET /api/inventory` — Retrieve all warehouse inventory allocations.
*   `POST /api/reservations/reserve` — Manually lock physical stock.

### **Transfers**
*   `GET /api/transfers` — Query transfer history logs.
*   `POST /api/transfers` — Perform multi-item stock transfer between depots.

### **Orders**
*   `GET /api/sales-orders` — List sales orders.
*   `POST /api/sales-orders` — Create new sales order (status `CREATED`).
*   `POST /api/sales-orders/{id}/confirm` — Ship and fulfill sales order.

---

## 🧪 Quick Integration Testing Guide

Test the following key flows to confirm everything is operational:
1. **Authentication:** Log in as `admin`. Log out and log in as `staff` to test view restrictions.
2. **Dashboard Telemetry:** Ensure stock metrics, valuation charts, capacity gauges, and notification elements render.
3. **Manual Reservation (Stock Lock):**
   *   Navigate to **Stock Allocation Hub** (Inventory).
   *   Click the **Lock Reserve Stock** button.
   *   Select a product, depot, and quantity (e.g., `5`), then submit. The "Reserved" number increments immediately.
4. **Order Outbound Shipping (Fulfillment):**
   *   Navigate to **Purchase Orders** or **Sales Orders**.
   *   Create an outbound order to see it lock corresponding units in status `CREATED`.
   *   Click **Ship** to finalize the order (units are subtracted from warehouse inventory, status updates to `CONFIRMFED`).
5. **Physical Stock Transfers:**
   *   Navigate to **Terminal Transfers**.
   *   Attempt a transfer between two depots. On submission, the quantities update immediately on the Stock Allocation Hub.
