RapidRide backend (development demo)

This is a minimal Express backend to test frontend/backend integration locally.

Features:
- In-memory user and ride stores (no database)
- JWT-based tokens (development secret)
- Endpoints:
  - GET  /api/health
  - POST /api/auth/register  { name, email, password, role }
  - POST /api/auth/login     { email, password }
  - GET  /api/auth/me        (requires Authorization: Bearer <token>)
  - POST /api/auth/logout
  - POST /api/rides/request  (requires auth)
  - GET  /api/rides/current  (requires auth)
  - GET  /api/rides/status   (requires auth)

Quick start:
1. cd backend
2. npm install
3. npm start

Notes:
- This server is deliberately simple for testing. Do not use it in production.
- You can set the JWT secret with the JWT_SECRET environment variable and change the port with PORT.
