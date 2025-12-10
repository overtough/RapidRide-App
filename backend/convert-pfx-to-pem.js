const fs = require('fs');
const forge = require('node-forge');

console.log('🔐 Converting PFX to PEM format...\n');

try {
    // Read PFX file
    const pfxData = fs.readFileSync('rapidride.pfx');
    const pfxAsn1 = forge.asn1.fromDer(pfxData.toString('binary'));
    const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, 'rapidride123');

    // Get certificate and private key
    const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
    const keyBags = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

    const cert = certBags[forge.pki.oids.certBag][0].cert;
    const key = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;

    // Convert to PEM
    const certPem = forge.pki.certificateToPem(cert);
    const keyPem = forge.pki.privateKeyToPem(key);

    // Write files
    fs.writeFileSync('cert.pem', certPem);
    fs.writeFileSync('key.pem', keyPem);

    console.log('✅ Created cert.pem');
    console.log('✅ Created key.pem');
    console.log('\n🎉 SSL certificates ready!');
    console.log('\n🚀 Next step: Restart your backend server');
    console.log('   The server will automatically detect the certificates');
    console.log('   and enable HTTPS on port 3001\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Installing node-forge...');
    require('child_process').execSync('npm install node-forge', { stdio: 'inherit' });
    console.log('\n✅ node-forge installed. Run this script again:');
    console.log('   node convert-pfx-to-pem.js');
}
