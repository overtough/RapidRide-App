// Test script to verify FastAPI integration
const fastapi = require('./services/fastapi');

async function testIntegration() {
  console.log('🧪 Testing FastAPI Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await fastapi.healthCheck();
    console.log('✅ Health:', health);
    console.log('');

    // Test 2: Fare Calculation
    console.log('2️⃣ Testing Fare Calculation...');
    const fare = await fastapi.calculateFare({
      origin: { lat: 12.9716, lng: 77.5946 },
      destination: { lat: 12.9352, lng: 77.6245 },
      traffic_level: 1.2
    });
    console.log('✅ Fare:', fare);
    console.log('');

    // Test 3: ETA Prediction
    console.log('3️⃣ Testing ETA Prediction...');
    const eta = await fastapi.predictETA({
      origin: { lat: 12.9716, lng: 77.5946 },
      destination: { lat: 12.9352, lng: 77.6245 }
    });
    console.log('✅ ETA:', eta);
    console.log('   Minutes:', Math.round(eta.eta_seconds / 60));
    console.log('');

    // Test 4: Reverse Geocoding
    console.log('4️⃣ Testing Reverse Geocoding...');
    const address = await fastapi.reverseGeocode(12.9716, 77.5946);
    console.log('✅ Address:', address.formatted_address);
    console.log('');

    console.log('🎉 All tests passed!\n');
    console.log('Your Node backend is successfully integrated with FastAPI!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure FastAPI is running: cd ../rapidride-fastapi && .\\run.ps1');
  }
}

testIntegration();
