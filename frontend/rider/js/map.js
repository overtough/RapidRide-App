// rider/js/map.js
// tiny helper to create a marker node
function createMarker(id,cls,xPct,yPct){
  const el = document.createElement('div');
  el.className = 'marker '+(cls||'');
  el.dataset.id = id;
  el.style.left = xPct+'%';
  el.style.top = yPct+'%';
  el.textContent = id;
  return el;
}
