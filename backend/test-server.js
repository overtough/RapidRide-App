const express = require('express');
const cors = require('cors');
const fastapi = require('./services/fastapi');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock user storage (in-memory for testing)
const users = new Map();
const JWT_SECRET = 'test-secret-123';

// Mock JWT functions
function generateToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, gender, avatar } = req.body;
  
  if (users.has(email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const user = {
    id: Date.now().toString(),
    name,
    email,
    role: role || 'rider',
    gender,
    avatar,
    createdAt: new Date().toISOString()
  };
  
  users.set(email, { ...user, password });
  const token = generateToken(user);
  
  res.json({ token, user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  const token = generateToken(userWithoutPassword);
  
  res.json({ token, user: userWithoutPassword });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.get(payload.email);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const fastapiHealth = await fastapi.healthCheck();
  res.json({ 
    ok: true, 
    uptime: process.uptime(), 
    time: new Date().toISOString(),
    fastapi: fastapiHealth
  });
});

// Estimate endpoint (fare + ETA)
app.post('/api/rides/estimate', async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const { pickup, dropoff, traffic_level } = req.body;
    
    if (!pickup || !dropoff) {
      return res.status(400).json({ error: 'pickup and dropoff required' });
    }

    // Convert lat/lon to lat/lng for FastAPI service
    const origin = { lat: pickup.lat, lng: pickup.lon };
    const destination = { lat: dropoff.lat, lng: dropoff.lon };
    
    console.log('Origin:', origin, 'Destination:', destination);

    const [fareResult, etaResult] = await Promise.all([
      fastapi.calculateFare({ origin, destination, traffic_level }),
      fastapi.predictETA({ origin, destination, traffic_level })
    ]);

    res.json({
      pickup,
      dropoff,
      fare: fareResult.fare,
      distance_km: fareResult.distance_km,
      currency: fareResult.currency || 'INR',
      eta_seconds: etaResult.eta_seconds,
      eta_minutes: Math.round(etaResult.eta_seconds / 60),
      confidence: etaResult.confidence,
      using_fallback: fareResult.fallback || etaResult.fallback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Geocode endpoint
app.get('/api/rides/geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon required' });
    }

    const result = await fastapi.reverseGeocode(parseFloat(lat), parseFloat(lon));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/rides/estimate`);
  console.log(`   GET  /api/rides/geocode?lat=12.9716&lon=77.5946`);
});
