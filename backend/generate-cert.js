const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'certs');

// Ensure certs directory exists
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

console.log('🔐 Generating self-signed certificate for HTTPS...\n');

try {
  // Try using OpenSSL if available
  const keyPath = path.join(certsDir, 'server.key');
  const certPath = path.join(certsDir, 'server.crt');
  
  // Generate private key
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
  
  // Generate certificate
  execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/CN=192.168.184.27/O=RapidRide/C=US"`, { stdio: 'inherit' });
  
  console.log('\n✅ Certificate generated successfully!');
  console.log(`   Key:  ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
  console.log('\n⚠️  IMPORTANT: On mobile devices, accept the security warning');
  
} catch (error) {
  console.log('❌ OpenSSL not found. Using alternative method...\n');
  
  try {
    // Fallback: Use selfsigned npm package
    const selfsigned = require('selfsigned');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    
    const pems = selfsigned.generate(attrs, { days: 365 });
    
    console.log('Generated pems:', typeof pems, pems ? Object.keys(pems) : 'null');
    
    if (!pems || !pems.private || !pems.cert) {
      throw new Error('Failed to generate certificates - pems is ' + typeof pems);
    }
    
    const keyPath = path.join(certsDir, 'server.key');
    const certPath = path.join(certsDir, 'server.crt');
    
    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);
    
    console.log('✅ Certificate generated successfully!');
    console.log(`   Key:  ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    console.log('\n⚠️  IMPORTANT: On mobile devices, accept the security warning');
  } catch (fallbackError) {
    console.error('❌ Failed to generate certificate:', fallbackError.message);
    console.error('Stack:', fallbackError.stack);
    process.exit(1);
  }
}
