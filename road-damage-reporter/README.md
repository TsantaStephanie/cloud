# Road Damage Reporter

A comprehensive web and mobile application for reporting and tracking road damage issues.

## Project Structure

```
road-damage-reporter/
├── backend/                 # Node.js API server
├── frontend-web/           # React web application
├── frontend-mobile/        # Vue.js mobile application
├── database/              # Database schema and seed data
├── docker/                # Docker configurations
└── README.md              # This file
```

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **Multer** for file uploads
- **Helmet** for security
- **CORS** for cross-origin requests

### Frontend Web
- **React** with TypeScript
- **Create React App** template
- Modern UI components

### Frontend Mobile
- **Vue.js 3** with Vite
- **TypeScript** support
- Modern mobile-first design

### Database
- **MySQL 8.0**
- Structured schema for users, reports, and comments

### DevOps
- **Docker** and Docker Compose
- Containerized development environment

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- MySQL (if running locally)

### Using Docker (Recommended)

1. Clone the repository
2. Navigate to the project root
3. Run the application:

```bash
cd docker
docker-compose up --build
```

This will start:
- Backend API: http://localhost:3000
- Frontend Web: http://localhost:3001
- Frontend Mobile: http://localhost:5173
- MySQL Database: localhost:3306

### Manual Setup

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend Web
```bash
cd frontend-web
npm install
npm start
```

#### Frontend Mobile
```bash
cd frontend-mobile
npm install
npm run dev
```

#### Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Damage Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Comments
- `GET /api/reports/:id/comments` - Get report comments
- `POST /api/reports/:id/comments` - Add comment

## Database Schema

### Users
- id, username, email, password_hash, role, timestamps

### Damage Reports
- id, user_id, title, description, latitude, longitude, severity, status, image_url, timestamps

### Comments
- id, report_id, user_id, content, timestamp

## Development

### Environment Variables

Create `.env` files in each service directory:

#### Backend (.env)
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=road_damage_db
DB_USER=app_user
DB_PASSWORD=app_password
JWT_SECRET=your-super-secret-jwt-key
```

### Running Tests
```bash
# Backend
cd backend && npm test

# Frontend Web
cd frontend-web && npm test

# Frontend Mobile
cd frontend-mobile && npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.
