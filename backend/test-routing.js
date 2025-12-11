const fetch = require('node-fetch');

async function testProvider(name, url) {
    console.log(`\nTesting ${name}...`);
    console.log(`URL: ${url}`);
    try {
        const start = Date.now();
        const response = await fetch(url);
        const time = Date.now() - start;

        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Time: ${time}ms`);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! Route found.');
            console.log('Distance:', data.routes[0].distance, 'meters');
        } else {
            const text = await response.text();
            console.log('❌ Failed:', text.substring(0, 100)); // Log first 100 chars
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function runTests() {
    // Coordinates for Hyderabad (from user logs)
    const pickup = '78.4953875,17.3997648';
    const drop = '78.49734035,17.406157299999997';

    // 1. Original OSRM
    await testProvider(
        'OSRM (project-osrm.org)',
        `https://router.project-osrm.org/route/v1/driving/${pickup};${drop}?overview=full&geometries=geojson`
    );

    // 2. OpenStreetMap DE (Another OSRM instance)
    await testProvider(
        'OSM DE (routing.openstreetmap.de)',
        `http://routing.openstreetmap.de/routed-car/route/v1/driving/${pickup};${drop}?overview=full&geometries=geojson`
    );

}

runTests();
