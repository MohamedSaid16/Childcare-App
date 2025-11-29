# 🏫 Nursery Management System

A comprehensive full-stack web application for managing nursery operations, parent communication, employee tracking, and billing. Built with **React**, **Node.js/Express**, and **MySQL**, featuring robust role-based access for parents, educators, and administrators.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [User Roles & Permissions](#user-roles--permissions)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Roadmap](#roadmap)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)

---

## ✨ Features

**For Parents**
- Secure login and registration
- Manage multiple children profiles
- Real-time child tracking and attendance status
- View daily activities and photos
- Access detailed daily reports (meals, naps, activities, notes)
- Direct messaging with educators
- View child schedule and events
- View invoices and payment history, pay online
- Receive real-time activity notifications

**For Educators/Staff**
- Employee dashboard with assigned groups
- Mark attendance; check-in/out times
- Log daily activities and observations
- Upload photos and media
- Add notes and behavioral observations
- Manage and report medical alerts
- Send notifications to parents
- View assigned children and groups
- Record meals and naps
- Generate daily summaries

**For Administrators**
- Manage all users (parents, employees, admins)
- Manage children and assignments
- Manage employee accounts and roles
- Create and manage classrooms/groups
- Assign educators to groups
- Manage billing and invoicing
- Track payments and generate reports
- View analytics and system reports
- Configure billing (rates, discounts, VAT)
- Send notifications system-wide
- Monitor capacity and occupancy

---

## 🛠 Tech Stack

**Frontend:**  
- React 18+  
- React Router  
- Context API  
- Axios  
- Tailwind CSS or custom CSS  
- Material-UI / Bootstrap (optional)

**Backend:**  
- Node.js  
- Express.js  
- MySQL  
- Sequelize ORM  
- JWT Authentication  
- Bcrypt password hashing  
- Multer (file uploads)  
- PDFKit / html2pdf (invoice PDF generation)

**DevOps:**  
- Docker & Docker Compose  
- Git

---

See [API Documentation](docs/api.md) for detailed endpoint information.

---

## 📁 Project Structure

```
nursery-management-app/
├── README.md
├── .env
├── package.json
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── hooks/
│       ├── utils/
│       ├── router/
│       ├── App.jsx
│       ├── index.js
│       └── App.css
├── backend/
│   ├── package.json
│   ├── .env
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   ├── utils/
│   └── scripts/
├── docs/
│   ├── uml/
│   └── api.md
└── infra/
    ├── docker-compose.yml
    └── Dockerfile
```

---

## 🏗 System Architecture

```text
┌───────────┐      ┌──────────────┐      ┌─────────┐
│ React App │ ──►  │ Express API  │ ──►  │ MySQL   │
│ Frontend  │      │ Backend      │      │ Database│
└───────────┘      └──────────────┘      └─────────┘
```

---

## 📦 Prerequisites

- Node.js (v14.0.0 or higher): [Download](https://nodejs.org/)
- npm (v6.0.0 or higher): bundled with Node.js
- MySQL (v5.7 or higher): [Download](https://dev.mysql.com/downloads/mysql/)
- Git: [Download](https://git-scm.com/)
- Docker & Docker Compose (optional): [Download](https://www.docker.com/)

### Verify Installation

```bash
node --version
npm --version
mysql --version
git --version
```

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nursery-management-app.git
cd nursery-management-app
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
nano .env # Edit configuration
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

---

## ⚙️ Configuration

**Backend .env Example**

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nursery_management

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

API_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

**MySQL Database Setup**

```sql
CREATE DATABASE nursery_management;
CREATE USER 'nursery_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON nursery_management.* TO 'nursery_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## ▶️ Running the Application

### Traditional Setup

**Terminal 1 - Backend**

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend**

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### Docker Compose Setup (Recommended)

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Development Mode (Hot Reload)

**Backend:**
```bash
cd backend
npm run dev
```
**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📚 API Documentation

> See [API Reference](docs/api.md) for a complete list of endpoints.

Some important endpoints:
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user info
- `GET /api/parent/dashboard` — Parent dashboard
- ...and many more!

---

## 🗄 Database Schema

### Key Models

**User**
- `id` (PK)
- `firstName`, `lastName`
- `email`, `password`
- `role` (`parent` | `employee` | `admin`)
- `phone`, `address`
- `createdAt`, `updatedAt`

**Child**
- `id` (PK)
- `firstName`, `lastName`
- `dateOfBirth`, `parentId` (FK), `groupId` (FK)
- `medicalInfo`, `allergies`, `photo`
- `createdAt`, `updatedAt`

**Attendance**
- `id` (PK)
- `childId` (FK), `date`
- `checkInTime`, `checkOutTime`
- `totalHours`
- `status` (`present` | `absent` | `late`)

**Activity**
- `id` (PK)
- `childId` (FK), `educatorId` (FK)
- `type` (`play` | `learning` | `meal` | `nap` | etc.)
- `notes`, `photos`, `date`
- `createdAt`

**Invoice**
- `id` (PK)
- `childId` (FK), `parentId` (FK)
- `periodStart`, `periodEnd`, `amount`
- `status` (`draft` | `sent` | `paid` | `overdue`)
- `dueDate`, `createdAt`

See [UML diagrams](docs/uml/) for detailed ER diagrams.

---

## 👥 User Roles & Permissions

### Parent
- View and manage own children
- Track child's attendance
- Access daily activities and reports
- Message educators
- View/pay invoices
- Receive notifications

### Educator/Staff
- Mark attendance
- Log activities/observations
- Add notes/photos
- Manage medical alerts
- Notify parents
- View assigned group

### Administrator
- Manage all users, billing, reports
- Configure system settings
- Manage groups and capacity

---

## 🚀 Deployment

Supports deployment to Heroku, DigitalOcean, or VPS with Docker.

### CORS Notes
- Ensure `CLIENT_URL` and `API_BASE_URL` are properly set in `.env` files.

---

## 📖 Documentation

- [Activity Diagram](docs/uml/activity-diagram.puml)
- [Database Schema](docs/uml/class-diagram.puml)
- [API Reference](docs/api.md)

---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

**Code Style**
- Follow ESLint rules
- Comment complex logic
- Use meaningful names

---

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 💬 Support

1. See [Issues](https://github.com/yourusername/nursery-management-app/issues)
2. Open a new issue if needed
3. Contact: `support@nurseryapp.com`

---

## 📊 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video streaming for parent monitoring
- [ ] AI-powered attendance recognition
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with payment gateways (Stripe, PayPal)
- [ ] SMS notifications
- [ ] WhatsApp integration

---

## 👨‍💻 Authors

- **Your Name** — [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Inspired by real nursery workflows
- Built for educational and practical use
- Thanks to React, Express, and OSS communities

---

_Last Updated: November 29, 2025 — Version 1.0.0_
