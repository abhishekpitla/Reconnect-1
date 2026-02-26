# 🔗 Reconnect

> A social media app where users broadcast activities and reconnect with lost connections.

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on port 27017 (or use Docker)
- **npm** or **yarn**

### 1. Clone & Install

```bash
cd Reconnect

# Install backend dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

### 2. Start MongoDB

If MongoDB is not already running:
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name reconnect-mongo mongo:7

# Or start your local MongoDB service
mongod
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
# Terminal 1 - Backend (port 5000)
cd server
npm run dev

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🐳 Docker Setup

```bash
docker-compose up --build
```

Then seed the database:
```bash
docker exec reconnect-server node src/seed.js
```

App runs at **http://localhost:3000**

---

## 📡 API Endpoints

### Authentication
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@reconnect.app","password":"password123"}'

# Get current user
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Users
```bash
# Search users
curl "http://localhost:5000/api/users/search?q=maya" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user profile
curl http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update profile
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","bio":"New bio"}'
```

### Activities
```bash
# Create activity
curl -X POST http://localhost:5000/api/activities \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Board Game Night","description":"Join us!","location":"My place","time":"2026-03-01T18:00:00Z","audience":"friends"}'

# Get feed
curl http://localhost:5000/api/activities/feed \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user activities
curl http://localhost:5000/api/activities/user/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete activity
curl -X DELETE http://localhost:5000/api/activities/ACTIVITY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Connections
```bash
# Send connection request
curl -X POST http://localhost:5000/api/connections/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId":"USER_ID"}'

# Accept connection
curl -X PUT http://localhost:5000/api/connections/CONNECTION_ID/accept \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get friends list
curl http://localhost:5000/api/connections/friends \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get pending requests
curl http://localhost:5000/api/connections/pending \
  -H "Authorization: Bearer YOUR_TOKEN"

# Remove connection
curl -X DELETE http://localhost:5000/api/connections/CONNECTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Engagements
```bash
# Toggle engagement (interested / me_too)
curl -X POST http://localhost:5000/api/engagements/toggle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"activityId":"ACTIVITY_ID","type":"interested"}'

# Get activity engagements
curl http://localhost:5000/api/engagements/activity/ACTIVITY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Notifications
```bash
# Get notifications
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark as read
curl -X PUT http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark all as read
curl -X PUT http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏗️ Architecture

```
Reconnect/
├── server/                    # Express.js backend
│   ├── src/
│   │   ├── config/           # DB & Socket.io config
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth & validation
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── index.js          # Server entry point
│   │   └── seed.js           # Database seeder
│   ├── Dockerfile
│   └── package.json
├── client/                    # React frontend
│   ├── src/
│   │   ├── context/          # Auth & Notification contexts
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service (axios)
│   │   ├── App.jsx           # Main app with routing
│   │   ├── index.css         # Design system
│   │   └── main.jsx          # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| Real-time | Socket.io |
| Styling | Custom CSS (dark theme) |
| DevOps | Docker, Docker Compose, Nginx |

## ✨ Features

- 🔐 JWT authentication (signup/login)
- 👤 User profiles with avatar, bio
- 📢 Activity broadcasting (friends/public)
- 📡 Chronological activity feed
- 👥 Connections (send/accept/remove)
- ❤️ Engagement (Interested / Me Too!)
- 🔔 Real-time notifications via Socket.io
- 🌙 Beautiful dark theme UI
- 📱 Responsive design
- 🐳 Docker ready
