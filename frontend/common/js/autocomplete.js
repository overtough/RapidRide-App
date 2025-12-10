// Location Autocomplete with Photon API (OpenStreetMap-based, faster than Nominatim)
(function() {
  'use strict';

  // Using Photon API - fast, free geocoding API
  const PHOTON_API = 'https://photon.komoot.io/api/';
  const DELAY_MS = 300;
  let debounceTimer;

  // Popular Indian cities and landmarks
  const POPULAR_PLACES = [
    { name: 'Indira Gandhi International Airport, New Delhi', lat: 28.5562, lon: 77.1000 },
    { name: 'Connaught Place, New Delhi', lat: 28.6315, lon: 77.2167 },
    { name: 'India Gate, New Delhi', lat: 28.6129, lon: 77.2295 },
    { name: 'Qutub Minar, New Delhi', lat: 28.5244, lon: 77.1855 },
    { name: 'Red Fort, New Delhi', lat: 28.6562, lon: 77.2410 },
    { name: 'Lotus Temple, New Delhi', lat: 28.5535, lon: 77.2588 },
    { name: 'Akshardham Temple, New Delhi', lat: 28.6127, lon: 77.2773 },
    { name: 'Kempegowda International Airport, Bangalore', lat: 13.1986, lon: 77.7066 },
    { name: 'MG Road, Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Cubbon Park, Bangalore', lat: 12.9763, lon: 77.5929 },
    { name: 'Vidhana Soudha, Bangalore', lat: 12.9791, lon: 77.5913 },
    { name: 'Chhatrapati Shivaji Maharaj Airport, Mumbai', lat: 19.0896, lon: 72.8656 },
    { name: 'Gateway of India, Mumbai', lat: 18.9220, lon: 72.8347 },
    { name: 'Marine Drive, Mumbai', lat: 18.9432, lon: 72.8236 },
    { name: 'Rajiv Gandhi International Airport, Hyderabad', lat: 17.2403, lon: 78.4294 },
    { name: 'Charminar, Hyderabad', lat: 17.3616, lon: 78.4747 },
    { name: 'Hussain Sagar Lake, Hyderabad', lat: 17.4239, lon: 78.4738 },
    { name: 'Hitech City, Hyderabad', lat: 17.4485, lon: 78.3908 },
    { name: 'Banjara Hills, Hyderabad', lat: 17.4239, lon: 78.4482 }
  ];

  function createAutocomplete(inputElement, onSelect) {
    if (!inputElement) {
      console.error('Input element not found for autocomplete');
      return null;
    }

    console.log('Creating autocomplete for:', inputElement.id);

    const container = document.createElement('div');
    container.className = 'autocomplete-container';
    container.style.cssText = `
      position: relative;
      width: 100%;
      display: block;
    `;

    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: rgba(15, 23, 42, 0.98);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: 12px;
      max-height: 320px;
      overflow-y: auto;
      display: none;
      z-index: 10000;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.2);
    `;

    // Wrap the input - handle both wrapped and unwrapped inputs
    const parent = inputElement.parentNode;
    if (parent.classList.contains('autocomplete-container')) {
      // Already wrapped, just add dropdown
      parent.appendChild(dropdown);
    } else {
      // Need to wrap
      parent.insertBefore(container, inputElement);
      container.appendChild(inputElement);
      container.appendChild(dropdown);
    }

    let currentResults = [];
    let selectedIndex = -1;

    function showDropdown() {
      console.log('Showing dropdown');
      dropdown.style.display = 'block';
    }

    function hideDropdown() {
      console.log('Hiding dropdown');
      dropdown.style.display = 'none';
      selectedIndex = -1;
    }

    function renderResults(results) {
      console.log('Rendering results:', results.length);
      dropdown.innerHTML = '';
      currentResults = results;

      if (results.length === 0) {
        dropdown.innerHTML = `
          <div style="padding: 1.5rem; text-align: center; color: #94a3b8;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
            <div>No locations found</div>
            <div style="font-size: 0.85rem; margin-top: 0.25rem; opacity: 0.7;">Try a different search</div>
          </div>`;
        showDropdown();
        return;
      }

      results.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.style.cssText = `
          padding: 1rem 1.25rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(99, 102, 241, 0.15);
          transition: all 0.15s ease;
          display: flex;
          align-items: start;
          gap: 0.75rem;
        `;

        const icon = result.type === 'popular' ? '⭐' : '📍';
        
        item.innerHTML = `
          <div style="font-size: 1.25rem; line-height: 1;">${icon}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${result.name}</div>
            <div style="font-size: 0.85rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${result.address || result.display_name || ''}</div>
          </div>
        `;

        item.addEventListener('mouseenter', () => {
          document.querySelectorAll('.autocomplete-item').forEach(i => {
            i.style.background = '';
          });
          item.style.background = 'rgba(99, 102, 241, 0.25)';
          selectedIndex = index;
        });

        item.addEventListener('mouseleave', () => {
          item.style.background = '';
        });

        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Item clicked:', result);
          selectResult(result);
        });

        dropdown.appendChild(item);
      });

      showDropdown();
    }

    function selectResult(result) {
      console.log('Selecting result:', result);
      inputElement.value = result.name;
      inputElement.dataset.lat = result.lat;
      inputElement.dataset.lon = result.lon;
      hideDropdown();
      if (onSelect) {
        onSelect({
          name: result.name,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        });
      }
    }

    async function searchLocations(query) {
      console.log('Searching for:', query);
      
      if (!query || query.length < 1) {
        // Show popular places for empty/short queries
        const filtered = POPULAR_PLACES.slice(0, 8).map(p => ({
          ...p,
          type: 'popular'
        }));
        renderResults(filtered);
        return;
      }

      // First, filter popular places
      const popularMatches = POPULAR_PLACES.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5).map(p => ({
        ...p,
        type: 'popular',
        display_name: p.name
      }));

      // Show popular matches immediately if found
      if (popularMatches.length > 0 && query.length < 3) {
        renderResults(popularMatches);
        return;
      }

      // Search using Photon API for queries with 2+ characters
      if (query.length >= 2) {
        try {
          const url = `${PHOTON_API}?q=${encodeURIComponent(query)}&limit=10&lang=en&lon=77.2090&lat=28.6139`;
          console.log('Fetching from Photon API:', url);
          
          const response = await fetch(url);
          const data = await response.json();
          
          console.log('Photon API response:', data);
          
          const results = data.features.map(item => {
            const props = item.properties;
            const coords = item.geometry.coordinates;
            
            // Build address from properties
            const addressParts = [
              props.street,
              props.district,
              props.city || props.state,
              props.country
            ].filter(Boolean);
            
            return {
              name: props.name || props.street || addressParts[0] || 'Unknown Location',
              display_name: addressParts.join(', '),
              lat: coords[1],
              lon: coords[0],
              address: addressParts.slice(1).join(', '),
              type: 'search'
            };
          });

          // Combine popular matches with API results
          const combined = [...popularMatches, ...results]
            .filter((item, index, self) => 
              index === self.findIndex(t => t.name === item.name)
            )
            .slice(0, 10);

          console.log('Combined results:', combined);
          renderResults(combined);
        } catch (error) {
          console.error('Autocomplete error:', error);
          // Fallback to popular matches
          if (popularMatches.length > 0) {
            renderResults(popularMatches);
          } else {
            renderResults([]);
          }
        }
      }
    }

    // Input event handler
    inputElement.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      console.log('Input changed:', query);
      
      clearTimeout(debounceTimer);
      
      if (query.length === 0) {
        // Show popular places immediately when cleared
        searchLocations('');
      } else {
        // Debounce for search
        debounceTimer = setTimeout(() => {
          searchLocations(query);
        }, DELAY_MS);
      }
    });

    // Focus handler - show popular places
    inputElement.addEventListener('focus', (e) => {
      console.log('Input focused');
      const query = e.target.value.trim();
      if (!query) {
        const popularResults = POPULAR_PLACES.slice(0, 8).map(p => ({
          ...p,
          type: 'popular',
          display_name: p.name
        }));
        renderResults(popularResults);
      } else {
        // Re-search if there's already text
        searchLocations(query);
      }
    });

    // Click handler - show dropdown on click
    inputElement.addEventListener('click', (e) => {
      console.log('Input clicked');
      const query = e.target.value.trim();
      if (!query && currentResults.length === 0) {
        const popularResults = POPULAR_PLACES.slice(0, 8).map(p => ({
          ...p,
          type: 'popular',
          display_name: p.name
        }));
        renderResults(popularResults);
      } else if (currentResults.length > 0) {
        showDropdown();
      }
    });

    // Keyboard navigation
    inputElement.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.autocomplete-item');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection(items);
      } else if (e.key === 'Enter' && selectedIndex >= 0 && currentResults[selectedIndex]) {
        e.preventDefault();
        selectResult(currentResults[selectedIndex]);
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    });

    function updateSelection(items) {
      items.forEach((item, index) => {
        item.style.background = index === selectedIndex ? 
          'rgba(99, 102, 241, 0.25)' : '';
      });
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    // Click outside to close
    const closeHandler = (e) => {
      const containerElement = parent.classList.contains('autocomplete-container') ? parent : container;
      if (!containerElement.contains(e.target)) {
        hideDropdown();
      }
    };
    document.addEventListener('click', closeHandler);

    console.log('Autocomplete initialized successfully for:', inputElement.id);

    return {
      getLocation: () => {
        if (inputElement.dataset.lat && inputElement.dataset.lon) {
          return {
            name: inputElement.value,
            lat: parseFloat(inputElement.dataset.lat),
            lon: parseFloat(inputElement.dataset.lon)
          };
        }
        return null;
      },
      setLocation: (name, lat, lon) => {
        inputElement.value = name;
        inputElement.dataset.lat = lat;
        inputElement.dataset.lon = lon;
      },
      destroy: () => {
        document.removeEventListener('click', closeHandler);
      }
    };
  }

  // Export to window
  window.createLocationAutocomplete = createAutocomplete;
  console.log('Location autocomplete module loaded');

})();
