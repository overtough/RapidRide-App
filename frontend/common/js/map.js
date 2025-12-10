// common/js/map.js
// Leaflet + OpenStreetMap wrapper for RapidRide.
//
// Provides a simple API:
//
//   const api = await RRMap.init('mapId', { zoom: 13, locateZoom: 16 });
//   api.locateOnce();  // ask for user location once
//   api.startWatch(pos => { ... }); // watch user position
//   api.addOrUpdateDriver(id, lat, lng, { title });
//   api.clearDrivers();
//
// Works with your existing apiFetch (from auth.js) for backend calls.

(function () {
  if (window.RRMap) return; // don't redefine

  const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const LEAFLET_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

  function loadLeaflet() {
    if (window.L && window.L.map) return Promise.resolve();

    return new Promise((resolve, reject) => {
      // CSS
      if (!document.querySelector('link[data-leaflet-css]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = LEAFLET_CSS;
        link.setAttribute('data-leaflet-css', '1');
        document.head.appendChild(link);
      }

      // JS
      if (window.L && window.L.map) {
        return resolve();
      }

      if (!document.querySelector('script[data-leaflet-js]')) {
        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.defer = true;
        script.setAttribute('data-leaflet-js', '1');
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        // if script tag exists but not loaded, poll for L
        const check = setInterval(() => {
          if (window.L && window.L.map) {
            clearInterval(check);
            resolve();
          }
        }, 50);
      }
    });
  }

  async function init(containerId, options) {
    options = options || {};
    await loadLeaflet();

    const el = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;

    if (!el) throw new Error('RRMap.init: container not found: ' + containerId);

    // default center: Hyderabad
    const center = options.center || [17.3850, 78.4867];
    const zoom   = options.zoom   || 13;

    const map = L.map(el).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    let userMarker = null;
    const driverMarkers = new Map();
    let watchId = null;

    function setUserMarker(lat, lng) {
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      const pos = [lat, lng];
      if (!userMarker) {
        userMarker = L.marker(pos, { title: 'You' }).addTo(map);
      } else {
        userMarker.setLatLng(pos);
      }
    }

    function addOrUpdateDriver(id, lat, lng, opts) {
      if (!id || typeof lat !== 'number' || typeof lng !== 'number') return;
      const key = String(id);
      const pos = [lat, lng];
      const existing = driverMarkers.get(key);
      if (existing) {
        existing.setLatLng(pos);
      } else {
        const m = L.marker(pos, {
          title: (opts && opts.title) || ('Driver ' + key)
        }).addTo(map);
        driverMarkers.set(key, m);
      }
    }

    function removeDriver(id) {
      const key = String(id);
      const m = driverMarkers.get(key);
      if (m) {
        map.removeLayer(m);
        driverMarkers.delete(key);
      }
    }

    function clearDrivers() {
      driverMarkers.forEach(m => map.removeLayer(m));
      driverMarkers.clear();
    }

    function locateOnce() {
      if (!('geolocation' in navigator)) return Promise.reject(new Error('geolocation not available'));
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserMarker(lat, lng);
            // Don't set view here - let the caller handle animation
            resolve({ lat, lng, raw: pos });
          },
          err => {
            console.warn('geolocation error', err);
            reject(err);
          },
          { 
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
    }

    function startWatch(onUpdate, onError, geoOpts) {
      if (!('geolocation' in navigator)) return;
      if (watchId != null) return;
      watchId = navigator.geolocation.watchPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserMarker(lat, lng);
          if (typeof onUpdate === 'function') onUpdate(pos);
        },
        err => {
          console.warn('watchPosition error', err);
          if (typeof onError === 'function') onError(err);
        },
        Object.assign({
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 10000
        }, geoOpts || {})
      );
    }

    function stopWatch() {
      if (watchId != null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      watchId = null;
    }

    return {
      map,
      setUserMarker,
      addOrUpdateDriver,
      removeDriver,
      clearDrivers,
      locateOnce,
      startWatch,
      stopWatch
    };
  }

  window.RRMap = { init };
})();
