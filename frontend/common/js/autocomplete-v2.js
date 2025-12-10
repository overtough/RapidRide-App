// Simple Location Autocomplete with Photon API
console.log('🚀 Autocomplete v2 loading...');

const PHOTON_API = 'https://photon.komoot.io/api/';
let userLocation = null;

// Get user location
async function getUserLocation() {
  if (userLocation) return userLocation;
  
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          console.log('📍 User location:', userLocation);
          resolve(userLocation);
        },
        (err) => {
          console.warn('⚠️ Location denied, using default');
          userLocation = { lat: 28.6139, lon: 77.2090 };
          resolve(userLocation);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      userLocation = { lat: 28.6139, lon: 77.2090 };
      resolve(userLocation);
    }
  });
}

// Calculate distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatDistance(km) {
  if (km < 1) return Math.round(km * 1000) + 'm';
  return km.toFixed(1) + 'km';
}

// Popular places
const POPULAR = [
  { name: 'Indira Gandhi Airport', city: 'New Delhi', lat: 28.5562, lon: 77.1000 },
  { name: 'Connaught Place', city: 'New Delhi', lat: 28.6315, lon: 77.2167 },
  { name: 'India Gate', city: 'New Delhi', lat: 28.6129, lon: 77.2295 },
  { name: 'Qutub Minar', city: 'New Delhi', lat: 28.5244, lon: 77.1855 },
  { name: 'Red Fort', city: 'New Delhi', lat: 28.6562, lon: 77.2410 },
  { name: 'Lotus Temple', city: 'New Delhi', lat: 28.5535, lon: 77.2588 },
];

  function initAutocomplete(inputId, callback) {
    const input = document.getElementById(inputId);
    if (!input) {
      console.error('Input not found:', inputId);
      return null;
    }

    console.log('Initializing autocomplete for:', inputId);

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.id = inputId + '-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      background: #1e293b;
      border: 2px solid #6366f1;
      border-radius: 8px;
      max-height: 300px;
      overflow-y: auto;
      display: none;
      z-index: 99999;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      width: 100%;
      margin-top: 4px;
    `;

    // Insert dropdown after input's parent
    const wrapper = input.closest('.input-with-icon') || input.parentElement;
    wrapper.style.position = 'relative';
    wrapper.appendChild(dropdown);

    let currentResults = [];
    let selectedIndex = -1;
    let searchTimeout;

    function showResults(results) {
      currentResults = results;
      selectedIndex = -1;
      dropdown.innerHTML = '';

      if (results.length === 0) {
        dropdown.innerHTML = '<div style="padding: 1rem; color: #94a3b8; text-align: center;">No results found</div>';
        dropdown.style.display = 'block';
        return;
      }

      results.forEach((item, idx) => {
        const div = document.createElement('div');
        div.style.cssText = `
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #334155;
          transition: background 0.2s;
        `;
        
        let icon = '📍';
        let badge = '';
        
        if (item.popular) {
          icon = '⭐';
        } else if (item.nearby) {
          icon = '📌';
          badge = `<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; margin-left: 8px;">${formatDistance(item.distance)}</span>`;
        } else if (item.saved) {
          icon = item.type === 'home' ? '🏠' : item.type === 'work' ? '💼' : '⭐';
        }
        
        div.innerHTML = `
          <div style="display: flex; gap: 10px; align-items: start;">
            <span style="font-size: 1.2rem;">${icon}</span>
            <div style="flex: 1;">
              <div style="font-weight: 600; color: #f1f5f9; display: flex; align-items: center;">
                ${item.name}
                ${badge}
              </div>
              <div style="font-size: 0.85rem; color: #94a3b8;">${item.address || item.city || ''}</div>
            </div>
          </div>
        `;

        div.onmouseenter = () => {
          selectedIndex = idx;
          updateHighlight();
        };

        div.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          selectItem(item);
        };

        dropdown.appendChild(div);
      });

      dropdown.style.display = 'block';
      updateHighlight();
    }

    function updateHighlight() {
      const items = dropdown.children;
      for (let i = 0; i < items.length; i++) {
        items[i].style.background = i === selectedIndex ? 'rgba(99, 102, 241, 0.3)' : '';
      }
    }

    function selectItem(item) {
      input.value = item.name;
      input.dataset.lat = item.lat;
      input.dataset.lon = item.lon;
      dropdown.style.display = 'none';
      
      if (callback) {
        callback({
          name: item.name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        });
      }
    }

    async function search(query) {
      console.log('Searching:', query);

      // Get user location if not already obtained
      if (!userLocation) {
        await getUserLocation();
      }

      // No query - show nearby places and saved places
      if (!query || query.length < 2) {
        const results = [];
        
        // Add saved places (home, work)
        const savedHome = localStorage.getItem('rr_home_address');
        const savedWork = localStorage.getItem('rr_work_address');
        
        if (savedHome) {
          try {
            const home = JSON.parse(savedHome);
            results.push({ 
              ...home, 
              saved: true, 
              type: 'home',
              address: home.address || 'Saved location'
            });
          } catch (e) {}
        }
        
        if (savedWork) {
          try {
            const work = JSON.parse(savedWork);
            results.push({ 
              ...work, 
              saved: true, 
              type: 'work',
              address: work.address || 'Saved location'
            });
          } catch (e) {}
        }

        // Get nearby places based on user's location
        if (userLocation) {
          const nearby = await getNearbyPlaces(userLocation.lat, userLocation.lon);
          results.push(...nearby.slice(0, 5));
        }
        
        // Add popular places with distance
        const popularWithDistance = POPULAR.map(p => {
          const distance = userLocation ? getDistance(userLocation.lat, userLocation.lon, p.lat, p.lon) : 0;
          return { ...p, popular: true, address: p.city, distance };
        }).sort((a, b) => a.distance - b.distance).slice(0, 3);
        
        results.push(...popularWithDistance);

        showResults(results.slice(0, 8));
        return;
      }

      // Has query - search
      // Filter popular places
      const popularMatches = POPULAR.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      ).map(p => {
        const distance = userLocation ? getDistance(userLocation.lat, userLocation.lon, p.lat, p.lon) : 0;
        return { ...p, popular: true, address: p.city, distance };
      });

      // Show popular immediately
      if (popularMatches.length > 0) {
        showResults(popularMatches);
      }

      // Search using Photon API centered on user location
      try {
        let url = `${PHOTON_API}?q=${encodeURIComponent(query)}&limit=10`;
        if (userLocation) {
          url += `&lat=${userLocation.lat}&lon=${userLocation.lon}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();

        const apiResults = data.features.map(f => {
          const p = f.properties;
          const coords = f.geometry.coordinates;
          const distance = userLocation ? getDistance(userLocation.lat, userLocation.lon, coords[1], coords[0]) : 0;
          
          return {
            name: p.name || p.street || 'Unknown',
            address: [p.city, p.state, p.country].filter(Boolean).join(', '),
            lat: coords[1],
            lon: coords[0],
            distance: distance,
            nearby: distance < 10 // Mark as nearby if within 10km
          };
        }).sort((a, b) => a.distance - b.distance);

        const combined = [...popularMatches, ...apiResults].slice(0, 10);
        showResults(combined);
      } catch (err) {
        console.error('Search error:', err);
        if (popularMatches.length === 0) {
          showResults([]);
        }
      }
    }

    // Input events
    input.addEventListener('focus', async () => {
      console.log('Input focused');
      if (!input.value) {
        // Show loading state
        dropdown.innerHTML = '<div style="padding: 1rem; color: #94a3b8; text-align: center;">📍 Finding nearby places...</div>';
        dropdown.style.display = 'block';
        
        // Get and show suggestions
        await search('');
      }
    });

    input.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        search(e.target.value.trim());
      }, 300);
    });

    input.addEventListener('click', async () => {
      if (dropdown.children.length > 0) {
        dropdown.style.display = 'block';
      } else if (!input.value) {
        dropdown.innerHTML = '<div style="padding: 1rem; color: #94a3b8; text-align: center;">📍 Finding nearby places...</div>';
        dropdown.style.display = 'block';
        await search('');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (!dropdown.style.display || dropdown.style.display === 'none') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
        updateHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateHighlight();
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        selectItem(currentResults[selectedIndex]);
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    console.log('Autocomplete initialized for:', inputId);
    return { dropdown, search };
  }

  // Export
  window.initLocationAutocomplete = initAutocomplete;
  console.log('Autocomplete v2 loaded successfully');

})();
