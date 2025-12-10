# RapidRide - Ride Sharing Platform

## Quick Setup

### 1. Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud)
- Redis (or Memurai for Windows)
- Python 3.11+ (for ML service)
- Firebase CLI: `npm install -g firebase-tools`

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```
JWT_SECRET=your_generated_secret_here
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/rapidride
REDIS_URL=redis://localhost:6379
FASTAPI_URL=http://localhost:8001
ELASTICSEARCH_ENABLED=false
FIREBASE_ENABLED=false
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start backend:
```bash
npm start
```

### 3. FastAPI ML Service (Optional)
```bash
cd rapidride-fastapi
pip install -r requirements.txt
python -m app.main
```

### 4. Firebase Deployment

#### Option A: Deploy Everything to Firebase
```bash
firebase login
firebase deploy
```

#### Option B: Frontend on Firebase + Local Backend (for testing)
1. Update `frontend/common/js/config-production.js` with your local IP
2. Run: `firebase deploy --only hosting`
3. Keep backend running locally

### 5. Access URLs
- **Local**: http://localhost:3000
- **Firebase**: https://rapidrideonline.web.app
- **Riders**: /rider/rider_home.html
- **Drivers**: /driver/driver_home.html
- **Admin**: /admin/admin_login.html

### 6. Create Admin Account
```bash
cd backend
node create-admin.js
```

## Architecture
- **Frontend**: Vanilla JS, Leaflet maps, Socket.IO
- **Backend**: Node.js, Express, MongoDB, Redis
- **Auth**: Firebase Authentication (Phone + Email)
- **Real-time**: Socket.IO for live ride tracking
- **ML**: FastAPI + OSRM for routing & fare prediction

## Security Features
✅ JWT authentication (128-char secret)
✅ Rate limiting (5/15min auth, 100/min API)
✅ Input validation
✅ CORS whitelist
✅ WebSocket authentication
✅ Security headers (Helmet)

## Important Notes
1. MongoDB indexes are auto-created on first run
2. Redis is used for caching and metrics
3. Firebase credentials are in `frontend/common/js/firebase-config.js`
4. Keep your JWT_SECRET secure and never commit it
5. For production, enable HTTPS and update CORS origins

## Troubleshooting
- **MongoDB connection failed**: Start MongoDB service
- **Redis connection failed**: Start Redis/Memurai service
- **404 on API calls**: Check backend is running on port 3000
- **Geolocation not working**: Use HTTPS or localhost (Chrome requirement)

## Need Help?
Check the backend logs for detailed error messages.
