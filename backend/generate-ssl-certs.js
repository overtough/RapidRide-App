const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔐 Generating SSL certificates for HTTPS...\n');

// Check if OpenSSL is available
try {
    execSync('openssl version', { stdio: 'ignore' });
    console.log('✅ OpenSSL found, generating certificates...\n');

    // Generate private key and certificate
    execSync(
        'openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=IN/ST=Telangana/L=Hyderabad/O=RapidRide/CN=10.111.157.27"',
        { cwd: __dirname, stdio: 'inherit' }
    );

    console.log('\n✅ SSL certificates generated successfully!');
    console.log('   - cert.pem (certificate)');
    console.log('   - key.pem (private key)');
    console.log('\n🔒 HTTPS will be enabled on port 3001');
    console.log('⚠️  Note: This is a self-signed certificate');
    console.log('   Browsers will show a security warning - click "Advanced" → "Proceed"');

} catch (error) {
    console.log('❌ OpenSSL not found on this system\n');
    console.log('📥 Please install OpenSSL:');
    console.log('   Windows: https://slproweb.com/products/Win32OpenSSL.html');
    console.log('   Or use: choco install openssl (if you have Chocolatey)');
    console.log('\n💡 Alternative: Use HTTP instead (port 3000)');
    console.log('   The app will work but browsers will show mixed content warnings');
    process.exit(1);
}
