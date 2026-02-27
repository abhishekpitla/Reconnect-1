# 🔗 Reconnect

> A social media app where users broadcast activities and reconnect with lost connections.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MySQL** running locally
- **npm**

### 1. Install

```bash
cd Reconnect

# Backend
cd server && npm install && cd ..

# Frontend
cd client && npm install && cd ..
```

### 2. Configure Database

Create a MySQL database:
```sql
CREATE DATABASE reconnect;
```

Update `server/.env` with your MySQL credentials:
```env
PORT=5001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=reconnect
JWT_SECRET=reconnect_jwt_secret_key_2024_super_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates **5 demo users** with activities, connections, and engagements:

| Name          | Email                  | Password      |
|---------------|------------------------|---------------|
| Alex Johnson  | alex@reconnect.app     | password123   |
| Maya Patel    | maya@reconnect.app     | password123   |
| Jordan Lee    | jordan@reconnect.app   | password123   |
| Sam Rivera    | sam@reconnect.app      | password123   |
| Taylor Chen   | taylor@reconnect.app   | password123   |

### 4. Start the App

```bash
# Terminal 1 - Backend (port 5001)
cd server
node src/index.js

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/:id` | Get profile |
| PUT | `/api/users/profile` | Update profile |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/activities` | Create activity |
| GET | `/api/activities/feed` | Get feed |
| GET | `/api/activities/user/:id` | User activities |
| DELETE | `/api/activities/:id` | Delete activity |

### Connections
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/connections/request` | Send request |
| PUT | `/api/connections/:id/accept` | Accept |
| DELETE | `/api/connections/:id` | Remove |
| GET | `/api/connections/friends` | List friends |
| GET | `/api/connections/pending` | Pending requests |

### Engagements
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/engagements/toggle` | Toggle reaction |
| GET | `/api/engagements/activity/:id` | Get reactions |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark read |
| PUT | `/api/notifications/read-all` | Mark all read |

---

## 🏗️ Architecture

```
Reconnect/
├── server/                    # Express.js backend
│   ├── src/
│   │   ├── config/           # MySQL (Sequelize) & Socket.io
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth & validation
│   │   ├── models/           # Sequelize models & associations
│   │   ├── routes/           # API routes
│   │   ├── index.js          # Server entry point
│   │   └── seed.js           # Database seeder
│   └── package.json
├── client/                    # React frontend
│   ├── src/
│   │   ├── context/          # Auth & Notification contexts
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service (axios)
│   │   ├── App.jsx           # Main app with routing
│   │   ├── index.css         # Design system
│   │   └── main.jsx          # Entry point
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL, Sequelize ORM |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| Real-time | Socket.io |
| Styling | Custom CSS |

## ✨ Features

- 🔐 JWT authentication (signup/login)
- 👤 User profiles with avatar & bio
- 📢 Activity broadcasting (friends/public)
- 📡 Chronological activity feed
- 👥 Connections (send/accept/remove)
- ❤️ Engagement (Interested / Me Too!)
- 🔔 Real-time notifications via Socket.io
- 📱 Responsive design
