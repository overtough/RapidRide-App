// common/js/routing.js
// Shared routing logic for RapidRide
// Implements: Client-Side OSRM -> Backend Proxy -> Fallback

(function () {
    if (window.RapidRideRouting) return;

    const Routing = {
        /**
         * Calculate route between two points
         * @param {Object} start - {lat, lng} or {lat, lon}
         * @param {Object} end - {lat, lng} or {lat, lon}
         * @returns {Promise<Object>} OSRM route object (geometry, distance, duration)
         */
        getRoute: async function (start, end) {
            const startLat = start.lat;
            const startLng = start.lng || start.lon; // Handle both key names
            const endLat = end.lat;
            const endLng = end.lng || end.lon;

            if (!startLat || !startLng || !endLat || !endLng) {
                console.error('Routing: Invalid coordinates', { start, end });
                return null;
            }

            // 1. Try Client-Side OSRM (Direct Browser Request)
            // This is fastest and works for most users (unless their network scrapes/blocks it)
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

            try {
                // console.log('🗺️ Attempting Client-Side OSRM...');
                const response = await fetch(osrmUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data.routes && data.routes.length > 0) {
                        // console.log('✅ Client-Side Routing Success');
                        return data.routes[0];
                    }
                }
                throw new Error('OSRM Client Error: ' + response.status);
            } catch (clientError) {
                console.warn('⚠️ Client-side routing failed, trying proxy...', clientError.message);
            }

            // 2. Fallback to Backend Proxy
            // The backend handles CORS and has a "straight-line" mathematical fallback for 502s
            try {
                // Get Auth Token
                let token = localStorage.getItem('token');
                if (window.firebase && firebase.auth().currentUser) {
                    token = await firebase.auth().currentUser.getIdToken();
                }

                if (!token) {
                    console.warn('Routing: No auth token for proxy');
                    return null;
                }

                // console.log('🔄 Asking Backend Proxy...');
                const response = await fetch(
                    `${API_CONFIG.BASE_URL}/rides/route?pickup=${startLng},${startLat}&drop=${endLng},${endLat}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.routes && data.routes.length > 0) {
                        // console.log('✅ Backend Proxy Routing Success');
                        return data.routes[0];
                    }
                }
            } catch (proxyError) {
                console.error('❌ All routing attempts failed:', proxyError);
            }

            return null;
        }
    };

    window.RapidRideRouting = Routing;
})();
