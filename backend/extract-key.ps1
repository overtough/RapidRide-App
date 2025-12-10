$pfxPath = Join-Path $PSScriptRoot "rapidride.pfx"
$keyPath = Join-Path $PSScriptRoot "key.pem"

try {
    # Load PFX
    $pfxCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxPath, "rapidride123", [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)
    
    # Export private key as PEM
    $rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($pfxCert)
    $keyBytes = $rsa.ExportRSAPrivateKey()
    $keyPem = "-----BEGIN RSA PRIVATE KEY-----`n"
    $keyPem += [Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $keyPem += "`n-----END RSA PRIVATE KEY-----`n"
    [System.IO.File]::WriteAllText($keyPath, $keyPem)
    
    Write-Host "Created key.pem successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "SSL certificates are ready!" -ForegroundColor Cyan
    Write-Host "Restart your backend server to enable HTTPS" -ForegroundColor Yellow
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
