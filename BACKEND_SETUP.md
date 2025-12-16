# CashCompass Backend Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Postman (for API testing)

## Installation Steps

### 1. Navigate to backend folder

```powershell
cd backend
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

**MongoDB URI Format:**

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cashcompass?retryWrites=true&w=majority
```

**⚠️ SECURITY WARNING:** Never commit actual credentials. Always use environment variables and add `.env` to `.gitignore`.

### 4. Start the server

```powershell
npm run dev
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### 1. **Signup** (Register new user)

- **POST** `/api/auth/signup`
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

- **Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "createdAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. **Login**

- **POST** `/api/auth/login`
- **Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "lastLogin": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. **Get Profile** (Protected)

- **GET** `/api/auth/me`
- **Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

- **Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "lastLogin": "...",
      "createdAt": "..."
    }
  }
}
```

#### 4. **Update Profile** (Protected)

- **PUT** `/api/auth/profile`
- **Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

- **Body:**

```json
{
  "name": "John Updated",
  "phone": "+1987654321"
}
```

#### 5. **Change Password** (Protected)

- **PUT** `/api/auth/change-password`
- **Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

- **Body:**

```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

### Health Check

- **GET** `/api/health`
- Returns API status

## Using Postman

1. **Import Collection:**

   - Open Postman
   - Click "Import" > "File"
   - Select `CashCompass_Postman_Collection.json`

2. **Testing Flow:**
   - First, test **Signup** to create a user
   - Copy the `token` from the response
   - For protected routes, add header:
     - Key: `Authorization`
     - Value: `Bearer YOUR_TOKEN_HERE`
   - Test other endpoints

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Protected routes middleware
- ✅ Input validation
- ✅ Rate limiting (100 requests/15 min)
- ✅ Helmet security headers
- ✅ CORS configuration

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js          # Environment configuration
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   └── authController.js  # Auth logic
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js   # Error handling
│   ├── models/
│   │   └── User.js            # User schema
│   ├── routes/
│   │   └── authRoutes.js      # API routes
│   └── server.js              # Express server
├── .env                       # Environment variables
├── .env.example              # Example env file
└── package.json              # Dependencies
```

## Troubleshooting

**MongoDB Connection Error:**

- Verify your MongoDB URI is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure your database user has proper permissions

**JWT Token Error:**

- Make sure JWT_SECRET is set in .env
- Verify token format: `Bearer <token>`
- Check if token hasn't expired (default: 7 days)

**Port Already in Use:**

- Change PORT in .env file
- Or stop the process using port 5000
