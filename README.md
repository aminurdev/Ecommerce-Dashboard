# E-commerce Admin Panel Backend

A professional, industry-standard Node.js backend for e-commerce admin panel with comprehensive authentication, authorization, and user management features.

## 🚀 Features

- **Authentication & Authorization**

  - JWT-based authentication with refresh tokens
  - Google OAuth integration
  - Email verification system
  - Password reset functionality
  - Two-Factor Authentication (2FA)
  - Multiple user roles (super_admin, admin, manager, user)

- **Security**

  - Professional security headers (Helmet.js)
  - Rate limiting
  - CORS protection
  - Input validation and sanitization
  - SQL injection protection (Sequelize ORM)

- **Logging & Monitoring**

  - Professional logging with Winston
  - Daily log rotation
  - Error tracking and monitoring
  - Request/response logging

- **Database**

  - MySQL with Sequelize ORM
  - Database migrations and seeders
  - Connection pooling
  - Automatic table synchronization

- **Error Handling**
  - Global error handler
  - Structured error responses
  - Validation error handling
  - Proper HTTP status codes

## 📋 Prerequisites

- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ecommerce-admin-panel
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000

   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=ecommerce_admin
   DB_USERNAME=root
   DB_PASSWORD=password

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRES_IN=30d

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@yourdomain.com

   # URLs
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:5000
   ```

4. **Database setup**

   ```bash
   # Run migrations
   npm run migrate

   # Run seeders (creates super admin)
   npm run seed
   ```

5. **Start the application**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🐳 Docker Setup

1. **Using Docker Compose**

   ```bash
   docker-compose up -d
   ```

   This will start:

   - Node.js application on port 5000
   - MySQL database on port 3306
   - Redis for caching on port 6379
   - phpMyAdmin on port 8080

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "twoFactorToken": "123456" // Optional, required if 2FA is enabled
}
```

#### Verify Email

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "password": "NewSecurePass123!"
}
```

#### Refresh Token

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Enable 2FA

```http
POST /api/auth/enable-2fa
Authorization: Bearer <access-token>
```

#### Verify 2FA Setup

```http
POST /api/auth/verify-2fa
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "secret": "2fa-secret",
  "token": "123456"
}
```

#### Google OAuth

```http
GET /api/auth/google
```

### User Management Endpoints

#### Get Profile

```http
GET /api/users/profile
Authorization: Bearer <access-token>
```

#### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith"
}
```

#### Get All Users (Admin only)

```http
GET /api/users?page=1&limit=10&search=john&role=user&status=active
Authorization: Bearer <access-token>
```

#### Get User by ID (Admin only)

```http
GET /api/users/:id
Authorization: Bearer <access-token>
```

#### Update User (Admin only)

```http
PUT /api/users/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "role": "manager",
  "is_active": true
}
```

#### Delete User (Super Admin only)

```http
DELETE /api/users/:id
Authorization: Bearer <access-token>
```

## 🔐 User Roles

- **super_admin**: Full system access, can manage all users and settings
- **admin**: Can manage users and most system features
- **manager**: Limited administrative access
- **user**: Basic user access

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📝 Logging

The application uses Winston for logging with the following levels:

- **error**: Error messages
- **warn**: Warning messages
- **info**: Informational messages
- **debug**: Debug messages (development only)

Logs are stored in the `logs/` directory with daily rotation.

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000

# Use strong, unique secrets in production
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-refresh-secret>

# Use production database
DB_HOST=<production-db-host>
DB_NAME=<production-db-name>
DB_USERNAME=<production-db-username>
DB_PASSWORD=<production-db-password>

# Configure production email service
EMAIL_HOST=<production-smtp-host>
EMAIL_USER=<production-email>
EMAIL_PASS=<production-email-password>

# Set production URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### PM2 Process Management

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start src/app.js --name "ecommerce-admin"

# View logs
pm2 logs ecommerce-admin

# Restart application
pm2 restart ecommerce-admin

# Stop application
pm2 stop ecommerce-admin
```

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js          # Database configuration
│   └── config.js           # Sequelize CLI configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   └── userController.js   # User management logic
├── middleware/
│   ├── auth.js            # Authentication middleware
│   ├── errorHandler.js    # Global error handler
│   └── security.js        # Security configurations
├── models/
│   ├── User.js            # User model
│   └── RefreshToken.js    # Refresh token model
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   ├── userRoutes.js      # User management routes
│   └── index.js           # Route aggregation
├── utils/
│   ├── logger.js          # Winston logger configuration
│   ├── response.js        # Response handler utility
│   ├── email.js           # Email service
│   └── twoFactor.js       # 2FA utilities
├── validation/
│   ├── authValidation.js  # Authentication validation
│   └── userValidation.js  # User validation
├── migrations/            # Database migrations
├── seeders/              # Database seeders
└── app.js                # Main application file
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Security Notes

- Always use HTTPS in production
- Keep dependencies updated
- Use strong, unique secrets for JWT tokens
- Implement proper input validation
- Monitor for security vulnerabilities
- Use environment variables for sensitive configuration
- Implement proper rate limiting
- Use secure session management

## 📞 Support

For support, email support@yourdomain.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0

- Initial release
- Complete authentication system
- User management
- Role-based access control
- Email verification
- Two-factor authentication
- Google OAuth integration
- Professional logging
- Comprehensive error handling
