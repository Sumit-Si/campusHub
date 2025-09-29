# 🏫 CampusHub Backend

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

> A comprehensive REST API backend for campus management systems with role-based access control, supporting students, faculty, and administrators.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Security & Authentication

- **JWT-based authentication** with http-only cookies
- **API Key system** for additional security layer
- **Role-based access control** (RBAC) with three user roles
- **Input validation** using express-validator
- **CORS protection** with configurable origins

### 👥 User Management

- **Multi-role system**: Admin, Faculty, Student
- **User registration** with profile image upload
- **Secure login/logout** with token management
- **Profile management** and user data retrieval

### 📚 Academic Features

- **Course management** with materials and enrollments
- **Attendance tracking** with session-based records
- **Results management** with bulk operations
- **Announcements** with file attachments
- **Event management** with scheduling
- **Notification system** for real-time updates

### 🛠️ Technical Features

- **Modular architecture** with clean separation of concerns
- **File upload support** with multer and Cloudinary integration
- **Database optimization** with MongoDB and Mongoose
- **Error handling** with custom API error classes
- **Development tools** with nodemon and prettier

## 🚀 Tech Stack

| Category           | Technology               |
| ------------------ | ------------------------ |
| **Runtime**        | Node.js 18+              |
| **Framework**      | Express.js 5.x           |
| **Database**       | MongoDB 6+ with Mongoose |
| **Authentication** | JWT, bcryptjs            |
| **Validation**     | express-validator        |
| **File Upload**    | multer, Cloudinary       |
| **Email**          | nodemailer               |
| **Development**    | nodemon, prettier        |

## ⚡ Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB 6 or higher
- npm or yarn package manager

### 1. Clone and Install

```bash
git clone <repository-url>
cd campusHub
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Server

```bash
# Using Docker for MongoDB (recommended)
docker compose up -d

# Start the application
npm run dev
```

The server will start on `http://localhost:4000`

### 4. Verify Installation

```bash
curl http://localhost:4000/api/v1/healthCheck
```

## 📖 API Documentation

### Base URL

```
http://localhost:4000/api/v1
```

### Core Endpoints

#### 🔐 Authentication

| Method | Endpoint          | Description       | Auth Required |
| ------ | ----------------- | ----------------- | ------------- |
| POST   | `/users/register` | Register new user | ❌            |
| POST   | `/users/login`    | User login        | ❌            |
| GET    | `/users/me`       | Get user profile  | ✅            |
| POST   | `/users/api-key`  | Generate API key  | ✅            |

#### 📢 Announcements

| Method | Endpoint         | Description         | Roles          |
| ------ | ---------------- | ------------------- | -------------- |
| GET    | `/announcements` | List announcements  | All            |
| POST   | `/announcements` | Create announcement | Admin, Faculty |

#### 📚 Courses

| Method | Endpoint                 | Description          | Roles            |
| ------ | ------------------------ | -------------------- | ---------------- |
| GET    | `/courses`               | List courses         | All              |
| POST   | `/courses`               | Create course        | Admin            |
| GET    | `/courses/:id/materials` | Get course materials | Faculty, Student |
| POST   | `/courses/:id/materials` | Add materials        | Faculty          |

#### 📊 Attendance

| Method | Endpoint                       | Description           | Roles          |
| ------ | ------------------------------ | --------------------- | -------------- |
| POST   | `/attendance`                  | Create attendance     | Admin, Faculty |
| GET    | `/attendance/user/:userId`     | Get user attendance   | All            |
| GET    | `/attendance/course/:courseId` | Get course attendance | Admin, Faculty |

#### 🎯 Results

| Method | Endpoint              | Description         | Roles |
| ------ | --------------------- | ------------------- | ----- |
| POST   | `/results`            | Create results      | Admin |
| GET    | `/results/:studentId` | Get student results | All   |

#### 🎉 Events

| Method | Endpoint      | Description  | Roles          |
| ------ | ------------- | ------------ | -------------- |
| GET    | `/events`     | List events  | All            |
| POST   | `/events`     | Create event | Admin, Faculty |
| PUT    | `/events/:id` | Update event | Admin, Faculty |
| DELETE | `/events/:id` | Delete event | Admin, Faculty |

## 🔑 Authentication

### Authentication Flow

1. **Register/Login** → Receive JWT in http-only cookie
2. **Generate API Key** → Get API key for protected endpoints
3. **Access Resources** → Use both JWT cookie and API key header

```

## User Roles

| Role        | Permissions                                          |
| ----------- | ---------------------------------------------------- |
| **Admin**   | Full system access, user management, course creation |
| **Faculty** | Course materials, attendance, announcements, events  |
| **Student** | View courses, materials, results, announcements      |

## 📁 Project Structure

campusHub/
├── src/
│ ├── app.js # Express app configuration
│ ├── index.js # Server entry point
│ ├── constants.js # Application constants
│ ├── controllers/ # Request handlers
│ │ ├── user.controller.js
│ │ ├── course.controller.js
│ │ └── ...
│ ├── middlewares/ # Custom middlewares
│ │ ├── auth.middleware.js
│ │ ├── multer.middleware.js
│ │ └── validator.middleware.js
│ ├── models/ # Mongoose models
│ │ ├── user.model.js
│ │ ├── course.model.js
│ │ └── ...
│ ├── routes/ # API routes
│ │ ├── user.routes.js
│ │ ├── course.routes.js
│ │ └── ...
│ ├── services/ # Business logic
│ ├── utils/ # Utility functions
│ └── validators/ # Input validation
├── public/
│ └── temp/ # Temporary file storage
├── docker-compose.yml # MongoDB container
├── package.json
└── README.md
````

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017

# JWT Secrets
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
````

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Database Setup

#### Option 1: Docker (Recommended)

```bash
docker compose up -d
```

#### Option 2: Local MongoDB

```bash
# Install MongoDB locally
# Update MONGO_URI in .env to: mongodb://localhost:27017
```

<!-- ### Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
``` -->

<!-- ## 🚀 Deployment

### Production Environment

1. **Set Environment Variables**

   ```bash
   NODE_ENV=production
   PORT=4000
   MONGO_URI=mongodb://your-production-db
   ACCESS_TOKEN_SECRET=your-production-secret
   ```

2. **Install Dependencies**

   ```bash
   npm ci --only=production
   ```

3. **Start Application**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment-Specific Configurations

| Environment | Database      | CORS Origin                    | Logging           |
| ----------- | ------------- | ------------------------------ | ----------------- |
| Development | Local MongoDB | http://localhost:3000          | Console           |
| Staging     | MongoDB Atlas | https://staging.yourdomain.com | File              |
| Production  | MongoDB Atlas | https://yourdomain.com         | File + Monitoring | -->

## 📝 API Response Format

### Success Response

```json
{
  "statusCode": 200,
  "data": {
    // Response data
  },
  "message": "Success",
  "success": true
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation error",
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file
   - Verify network connectivity

2. **JWT Token Issues**
   - Check ACCESS_TOKEN_SECRET is set
   - Ensure cookies are enabled in client
   - Verify token expiration

3. **File Upload Problems**
   - Check multer configuration
   - Verify public/temp directory exists
   - Ensure file size limits are appropriate

### Debug Mode

```bash
DEBUG=campusHub:* npm run dev
```

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sumit Singh**

- GitHub: [@sumit-si](https://github.com/sumit-si)
- Email: pankajsinghtomar987@gmail.com

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️

</div>
