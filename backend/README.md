# CashCompass Backend API

Complete Node.js/Express backend with MongoDB authentication for CashCompass application.

## 🚀 Features

- User registration with validation
- Secure login with JWT tokens
- Password hashing with bcrypt
- Protected routes with JWT authentication
- User profile management
- Password change functionality
- Input validation
- Error handling middleware
- Security headers (Helmet)
- Rate limiting
- CORS configuration

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):

```bash
copy .env.example .env
```

4. Update the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cashcompass
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use the default connection string: `mongodb://localhost:27017/cashcompass`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

## 🏃 Running the Server

### Development mode (with auto-reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

#### 1. Sign Up

- **URL:** `POST /api/auth/signup`
- **Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "+1234567890"
}
```

- **Response:** User object + JWT token

#### 2. Login

- **URL:** `POST /api/auth/login`
- **Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

- **Response:** User object + JWT token

#### 3. Get Profile (Protected)

- **URL:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Current user profile

#### 4. Update Profile (Protected)

- **URL:** `PUT /api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "name": "John Updated",
  "phone": "+9876543210"
}
```

- **Response:** Updated user object

#### 5. Change Password (Protected)

- **URL:** `PUT /api/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword123",
  "confirmNewPassword": "newPassword123"
}
```

- **Response:** Success message

### Health Check

#### API Health

- **URL:** `GET /api/health`
- **Response:** API status

## 🧪 Testing with Postman

1. Import the `CashCompass_Postman_Collection.json` file into Postman
2. The collection includes all API endpoints
3. Environment variables are automatically set after login/signup

## 🔐 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Password Hashing:** Bcrypt with salt rounds
- **Helmet:** Security headers
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **CORS:** Configured for frontend origin
- **Input Validation:** Request body validation
- **Error Handling:** Centralized error handling

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js          # Environment configuration
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   └── authController.js  # Authentication logic
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── errorHandler.js    # Error handling
│   ├── models/
│   │   └── User.js            # User model schema
│   ├── routes/
│   │   └── authRoutes.js      # API routes
│   └── server.js              # Express server setup
├── .env                       # Environment variables
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
└── package.json              # Dependencies
```

## 🔧 Environment Variables

| Variable    | Description               | Default                               |
| ----------- | ------------------------- | ------------------------------------- |
| PORT        | Server port               | 5000                                  |
| NODE_ENV    | Environment               | development                           |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/cashcompass |
| JWT_SECRET  | Secret key for JWT        | Required                              |
| JWT_EXPIRE  | Token expiration time     | 7d                                    |
| CORS_ORIGIN | Allowed origin for CORS   | http://localhost:5173                 |

## 🐛 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## 📝 Success Responses

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

## 🚀 Deployment Tips

1. Change `JWT_SECRET` to a strong random string
2. Update `MONGODB_URI` to your production database
3. Set `NODE_ENV=production`
4. Use environment-specific CORS origins
5. Consider using a reverse proxy (nginx)
6. Enable HTTPS in production

## 📞 Support

For issues or questions, please check the API documentation or contact the development team.

---

Built with ❤️ for CashCompass
