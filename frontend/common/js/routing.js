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
            const startLng = start.lng || start.lon;
            const endLat = end.lat;
            const endLng = end.lng || end.lon;

            if (!startLat || !startLng || !endLat || !endLng) {
                console.error('Routing: Invalid coordinates', { start, end });
                return null;
            }

            // OSRM Public Servers (Mirrors for robustness)
            const mirrors = [
                'https://router.project-osrm.org/route/v1/driving',
                'https://routing.openstreetmap.de/routed-car/route/v1/driving'
            ];

            for (const baseUrl of mirrors) {
                const url = `${baseUrl}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
                try {
                    // console.log(`🗺️ Routing via ${baseUrl}...`);
                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.routes && data.routes.length > 0) {
                            return data.routes[0];
                        }
                    }
                } catch (err) {
                    console.warn(`⚠️ Routing failed on ${baseUrl}:`, err.message);
                }
            }

            console.error('❌ All client-side routing attempts failed.');
            return null;
        }
    };

    window.RapidRideRouting = Routing;
})();
