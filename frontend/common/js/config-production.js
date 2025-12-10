// Production config - Firebase Hosting with local backend
(function() {
  'use strict';
  
  // Your computer's local IP - update this if it changes
  const LOCAL_BACKEND_IP = '192.168.0.186';
  const HTTP_PORT = '3000';
  const HTTPS_PORT = '3001';
  
  // Detect if page is loaded via HTTPS
  const protocol = window.location.protocol;
  const port = protocol === 'https:' ? HTTPS_PORT : HTTP_PORT;
  
  window.API_CONFIG = {
    environment: 'PRODUCTION',
    apiUrl: `${protocol}//${LOCAL_BACKEND_IP}:${port}/api`,
    wsUrl: `${protocol}//${LOCAL_BACKEND_IP}:${port}`,
    BASE_URL: `${protocol}//${LOCAL_BACKEND_IP}:${port}/api`
  };

  console.log('🔧 Production API Config loaded:', window.API_CONFIG);
})();
