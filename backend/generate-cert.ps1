Write-Host "Generating self-signed SSL certificate for HTTPS..." -ForegroundColor Cyan
Write-Host ""

try {
    # Create self-signed certificate
    $cert = New-SelfSignedCertificate `
        -Subject "CN=10.111.157.27" `
        -DnsName "10.111.157.27", "localhost", "127.0.0.1" `
        -KeyAlgorithm RSA `
        -KeyLength 2048 `
        -NotBefore (Get-Date) `
        -NotAfter (Get-Date).AddYears(1) `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -FriendlyName "RapidRide Local HTTPS" `
        -HashAlgorithm SHA256 `
        -KeyUsage DigitalSignature, KeyEncipherment `
        -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")

    Write-Host "Certificate created in Windows Certificate Store" -ForegroundColor Green
    Write-Host "Thumbprint: $($cert.Thumbprint)" -ForegroundColor Gray
    Write-Host ""

    # Export certificate and private key as PFX
    $pfxPassword = ConvertTo-SecureString -String "rapidride123" -Force -AsPlainText
    $pfxPath = Join-Path $PSScriptRoot "rapidride.pfx"
    
    Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $pfxPassword | Out-Null
    Write-Host "Exported as PFX: rapidride.pfx" -ForegroundColor Green
    
    # Convert PFX to PEM format using .NET
    $certPath = Join-Path $PSScriptRoot "cert.pem"
    $keyPath = Join-Path $PSScriptRoot "key.pem"
    
    # Load PFX
    $pfxCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxPath, "rapidride123", [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)
    
    # Export certificate as PEM
    $certPem = "-----BEGIN CERTIFICATE-----`n"
    $certPem += [Convert]::ToBase64String($pfxCert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert), [System.Base64FormattingOptions]::InsertLineBreaks)
    $certPem += "`n-----END CERTIFICATE-----`n"
    [System.IO.File]::WriteAllText($certPath, $certPem)
    
    Write-Host "Created cert.pem" -ForegroundColor Green
    
    # Export private key as PEM
    $rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($pfxCert)
    $keyBytes = $rsa.ExportRSAPrivateKey()
    $keyPem = "-----BEGIN RSA PRIVATE KEY-----`n"
    $keyPem += [Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $keyPem += "`n-----END RSA PRIVATE KEY-----`n"
    [System.IO.File]::WriteAllText($keyPath, $keyPem)
    
    Write-Host "Created key.pem" -ForegroundColor Green
    Write-Host ""
    Write-Host "SSL certificates generated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Files created:" -ForegroundColor Yellow
    Write-Host "  - cert.pem (certificate)" -ForegroundColor Gray
    Write-Host "  - key.pem (private key)" -ForegroundColor Gray
    Write-Host "  - rapidride.pfx (backup)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "HTTPS will be enabled on port 3001" -ForegroundColor Cyan
    Write-Host "Note: This is a self-signed certificate" -ForegroundColor Yellow
    Write-Host "Browsers will show a security warning" -ForegroundColor Yellow
    Write-Host "Click Advanced and Proceed to site to continue" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next step: Restart your backend server" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error generating certificates:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Download OpenSSL manually" -ForegroundColor Yellow
    Write-Host "https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Gray
    exit 1
}
