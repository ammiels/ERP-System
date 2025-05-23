# Enterprise Resource Planning (ERP) System

A comprehensive ERP system built with React frontend and FastAPI microservices backend for warehouse inventory management, request processing, and business analytics.

## System Architecture

This ERP system uses a microservices architecture with the following components:

### Backend Services
- **Authentication Service** - User management and JWT authentication (Port 8000)
- **Dashboard Service** - Business analytics and reporting (Port 8001)
- **Inventory Service** - Warehouse inventory management (Port 8002)
- **Requests Service** - Order processing and request management (Port 8003)

### Frontend
- React-based single-page application with dark theme
- Chart.js for data visualization
- Responsive design for multiple device types
- JWT-based authentication system
- Responsive dashboard with custom chart components

### Project Structure
```
project_root/
├── backend/
│   ├── Authentication/    # Authentication service
│   ├── Dashboard/         # Analytics and reporting service
│   ├── Inventory/         # Inventory management service
│   └── Requests/          # Request processing service
├── frontend/
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions and helpers
│   │   │   └── testApi.js # API testing utility
│   │   ├── App.js         # Main application component
│   │   ├── config.js      # API endpoints configuration
│   │   └── index.js       # Application entry point
│   └── package.json       # Dependencies and scripts
└── README.md              # This file
```

## Prerequisites

- **Python** 3.8+ with pip
- **Node.js** 16+ and npm
- **PostgreSQL** database server
- Git (optional, for version control)

## Installation Guide

### 1. Clone the Repository (Optional)

```bash
git clone https://github.com/ammiels/ERP-System.git
cd ERP-System
```

### 2. Database Setup

1. Install PostgreSQL if not already installed
2. Create a new PostgreSQL database for the ERP system:

```bash
psql -U postgres
CREATE DATABASE erp_system;
CREATE USER erp_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE erp_system TO erp_user;
\q
```

### 3. Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment (recommended):
   ```bash
   # For Windows
   python -m venv venv
   venv\Scripts\activate
   
   # For macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with the following content:
   ```
   # Database Configuration
   DATABASE_URL=postgresql://erp_user:your_secure_password@localhost/erp_system
   
   # Security Settings
   # Generate a random key using: python -c "import os; print(os.urandom(32).hex())"
   SECRET_KEY=your_generated_secret_key
   ALGORITHM=HS256
   
   # CORS Settings
   ALLOWED_ORIGINS=http://localhost:8001,http://localhost:8002,http://localhost:8003,http://localhost:3000
   AUTH_TOKEN_URL=http://localhost:8000/auth/token
   ```

### 4. Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_AUTH_API_URL=http://localhost:8000
   REACT_APP_DASHBOARD_API_URL=http://localhost:8001
   REACT_APP_INVENTORY_API_URL=http://localhost:8002
   REACT_APP_REQUESTS_API_URL=http://localhost:8003
   ```

4. Create or verify `src/config.js` contains:
   ```javascript
   export const AUTH_API_URL = process.env.REACT_APP_AUTH_API_URL;
   export const DASHBOARD_API_URL = process.env.REACT_APP_DASHBOARD_API_URL;
   export const INVENTORY_API_URL = process.env.REACT_APP_INVENTORY_API_URL;
   export const REQUESTS_API_URL = process.env.REACT_APP_REQUESTS_API_URL;
   ```
## Running the Application With Docker
Ensure necessary files are added as seen below:
1)backend/.env:
   DATABASE_URL=postgresql://POSTGRES_USER:POSTGRES_PASSWORD@POSTGRES_HOST/POSTGRES_DB
   POSTGRES_USER=your-postgres-username
   POSTGRES_PASSWORD=your-postgres-password
   POSTGRES_DB=your-database-name
   POSTGRES_PORT=5432
   POSTGRES_HOST=postgres_db

   #Security Settings
   #Generate a random key using: python -c "import os; print(os.urandom(32).hex())"
   SECRET_KEY="your-secret-key"
   ALGORITHM="HS256"

   #Docker CORS Settings
   ALLOWED_ORIGINS=http://localhost:3000,http://frontend:3000,http://localhost:8000,http://auth:8000,http://dashboard:8001,http://inventoryservice:8002,http://requestsservice:8003
   AUTH_TOKEN_URL=http://authentication:8000/auth/token

2)frontend/.env:
   REACT_APP_AUTH_API_URL=http://localhost:8000
   REACT_APP_DASHBOARD_API_URL=http://localhost:8001
   REACT_APP_INVENTORY_API_URL=http://localhost:8002
   REACT_APP_REQUESTS_API_URL=http://localhost:8003
   
3)frontend/src/config.js:
   export const AUTH_API_URL = process.env.REACT_APP_AUTH_API_URL;
   export const DASHBOARD_API_URL = process.env.REACT_APP_DASHBOARD_API_URL;
   export const INVENTORY_API_URL = process.env.REACT_APP_INVENTORY_API_URL;
   export const REQUESTS_API_URL = process.env.REACT_APP_REQUESTS_API_URL;

4)run npm install from frontend directory terminal
5)the from root directory terminal run docker-compose up --build
frontend of app will then be found on: http://localhost:3000

stop running with:
docker-compose down

start running if its already built with:
docker-compose up

## Running the Application Without Docker

### 1. Start Backend Microservices
Open four separate terminal windows in the backend directory with the virtual environment activated:

```bash
# Terminal 1 - Authentication Service
uvicorn Authentication.main:app --reload --port 8000

# Terminal 2 - Dashboard Service
uvicorn Dashboard.main:app --reload --port 8001

# Terminal 3 - Inventory Service
uvicorn Inventory.main:app --reload --port 8002

# Terminal 4 - Requests Service
uvicorn Requests.main:app --reload --port 8003
```

### 2. Start Frontend Application
In a new terminal window in the frontend directory:

```bash
npm start
```

The application should automatically open in your default browser at http://localhost:3000.

## API Documentation

Once the services are running, API documentation is available at:

- Authentication API: http://localhost:8000/docs
- Dashboard API: http://localhost:8001/docs
- Inventory API: http://localhost:8002/docs
- Requests API: http://localhost:8003/docs

## Troubleshooting

### API Connection Issues

If you encounter 401 Unauthorized errors or other connection issues:

1. Verify all services are running by checking each service's URL in a browser
2. Check that the ports in `.env` files match the actual running services
3. Use the API testing utility:
   ```bash
   cd frontend/src/utils
   node testApi.js
   ```

#### API Testing Utility

The project includes a utility (`src/utils/testApi.js`) to test API connectivity:

```javascript
// To use in your components:
import { testRequestsApi } from '../utils/testApi';

// Then call with authentication token:
const isConnected = await testRequestsApi(token);
if (isConnected) {
  console.log("API connection successful");
} else {
  console.log("API connection failed");
}
```

### Database Connectivity

If database connection fails:

1. Verify PostgreSQL is running
2. Check the DATABASE_URL in the backend `.env` file
3. Ensure the database user has proper permissions

## .gitignore Guidelines

When using version control, ensure your `.gitignore` file includes:

```
# Environment files with sensitive data
.env
**/config.js

# Dependencies
/node_modules
**/venv
**/__pycache__

# Build artifacts
/build
/dist
*.pkl
```

## Frontend Features

### Dashboard Chart Features

The dashboard includes various charts with the following features:

- Dark theme compatible styling
- Responsive sizing for different screen sizes
- Custom color schemes for different chart types
- Dynamic data loading from the Dashboard API
- Fallback mechanisms for API connection failures

### Authentication Flow

The ERP system uses JWT (JSON Web Token) authentication:

1. User logs in via the Authentication service
2. JWT token is returned and stored in local storage
3. Token is included in Authorization header for all API requests
4. Token contains user role information used for permission-based UI rendering
5. Expired tokens are detected and user is redirected to login

Example token handling:
```javascript
// Extract user information from token
const token = localStorage.getItem('token');
try {
  const payload = JSON.parse(atob(token.split(".")[1]));
  // payload.role contains user role (admin, manager, employee)
  // payload.sub contains username
} catch (error) {
  // Token parsing error handling
}
```

## Available Frontend Scripts

In the frontend directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Recent Updates

### Dashboard Enhancements
- Fixed chart display issues with dark theme compatibility
- Improved chart responsiveness for different screen sizes
- Optimized color schemes for better data visualization

### API Connection Improvements
- Added resilient API path handling to try alternative endpoints
- Created API testing utility (`src/utils/testApi.js`)
- Fixed authentication token handling in Dashboard components

### Code Quality
- Fixed JavaScript syntax errors in Dashboard.js
- Addressed variable scope issues
- Improved error handling for API requests
- Enhanced logging for better debugging

## License

This project is proprietary and confidential.

## Contact

For support or questions, contact the system administrator.
