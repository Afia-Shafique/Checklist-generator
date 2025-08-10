# QA/QC Compliance System

A comprehensive construction document parser and compliance management system with authentication and dashboard functionality.

## Features

- **Document Upload & Processing**: Upload construction documents and extract compliance information
- **Authentication System**: Secure login/signup with JWT tokens and PostgreSQL database
- **Dashboard**: Modern dashboard with project overview and compliance tracking
- **Multi-language Support**: English and Arabic language support
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
Checklist-generator-main/
├── auth-backend/          # Authentication backend (Node.js/Express)
├── backend/              # Main backend (Python/Flask)
├── frontend/             # React frontend
├── scripts/              # Utility scripts
└── start_application.bat # Main startup script
```

## Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Checklist-generator-main
```

### 2. Database Setup

1. **Install PostgreSQL** if not already installed
2. **Create the database**:
   ```bash
   psql -U postgres
   CREATE DATABASE compliance_db;
   \q
   ```
3. **Run the auth database setup**:
   ```bash
   cd auth-backend
   psql -U postgres -d compliance_db -f setup-database.sql
   cd ..
   ```

### 3. Environment Configuration

#### Auth Backend
```bash
cd auth-backend
cp env.example .env
# Edit .env with your database credentials
cd ..
```

#### Main Backend
```bash
cd backend
# Install Python dependencies
pip install -r requirements.txt
cd ..
```

### 4. Start the Application

**Windows:**
```bash
start_application.bat
```

**Manual Start:**
```bash
# Terminal 1 - Main Backend
cd backend
python run.py

# Terminal 2 - Auth Backend
cd auth-backend
npm install
npm run dev

# Terminal 3 - Frontend
cd frontend
npm install
npm start
```

## Access Points

- **Frontend**: http://localhost:3000
- **Main Backend API**: http://localhost:5000
- **Auth Backend API**: http://localhost:5001

## Authentication Flow

1. **Landing Page** → Click "Get Started" → **Login Page**
2. **Login Page** → Enter credentials → **Dashboard** (if authenticated)
3. **Signup Page** → Create account → **Login Page** (after successful registration)

## API Endpoints

### Authentication (Port 5001)

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Authenticate user

### Main Backend (Port 5000)

- `POST /api/upload` - Upload documents
- `GET /api/results` - Get processing results
- Additional endpoints for document processing

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    region_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for frontend integration
- **Input Validation**: Server-side validation for all inputs
- **Protected Routes**: Frontend routes protected by authentication

## Development

### Frontend Structure
```
frontend/src/
├── components/           # React components
│   ├── Login.jsx        # Login component
│   ├── Signup.jsx       # Signup component
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Sidebar.jsx      # Navigation sidebar
│   ├── Header.jsx       # Dashboard header
│   └── ...
├── styles/              # CSS files
│   ├── Auth.css         # Authentication styles
│   └── Dashboard.css    # Dashboard styles
└── pages/               # Page components
```

### Backend Structure
```
auth-backend/
├── server.js            # Main server file
├── auth.js              # Authentication routes
├── db.js                # Database connection
├── package.json         # Dependencies
└── setup-database.sql   # Database schema
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000, 5000, and 5001 are available
2. **Database Connection**: Verify PostgreSQL is running and credentials are correct
3. **Dependencies**: Run `npm install` in both frontend and auth-backend directories
4. **Environment Variables**: Ensure `.env` files are properly configured

### Logs

- **Frontend**: Check browser console for errors
- **Auth Backend**: Check terminal running auth-backend
- **Main Backend**: Check terminal running Python backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
