const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'certs');

// Ensure certs directory exists
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

console.log('🔐 Generating self-signed certificate for HTTPS...\n');

// Generate a keypair
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create a certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'organizationName',
  value: 'RapidRide'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Add subjectAltName extension
cert.setExtensions([{
  name: 'subjectAltName',
  altNames: [{
    type: 2, // DNS
    value: 'localhost'
  }, {
    type: 2, // DNS
    value: '192.168.184.27'
  }, {
    type: 7, // IP
    ip: '127.0.0.1'
  }, {
    type: 7, // IP
    ip: '192.168.184.27'
  }]
}]);

// Self-sign certificate
cert.sign(keys.privateKey, forge.md.sha256.create());

// Convert to PEM
const pemCert = forge.pki.certificateToPem(cert);
const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

// Save to files
const keyPath = path.join(certsDir, 'server.key');
const certPath = path.join(certsDir, 'server.crt');

fs.writeFileSync(keyPath, pemKey);
fs.writeFileSync(certPath, pemCert);

console.log('✅ Certificate generated successfully!');
console.log(`   Key:  ${keyPath}`);
console.log(`   Cert: ${certPath}`);
console.log('\n⚠️  IMPORTANT: On mobile devices, you\'ll need to:');
console.log('   1. Visit the HTTPS URL');
console.log('   2. Click "Advanced" or "Details"');
console.log('   3. Click "Proceed to site" or "Accept risk"');
