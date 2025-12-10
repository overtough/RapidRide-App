// rider/js/app.js
// Real-time driver simulation and basic ride-matching.
// Integrates with Auth and auto-initializes on pages with #map

(function(){

  const DRIVER_COUNT = 9;
  const UPDATE_MS = 900;
  const MAP_CENTER = { x:50, y:60 };

  const mapEl = document.getElementById('map');
  const driverListEl = document.getElementById('driverList');
  const eventLogEl = document.getElementById('eventLog');
  const ridersStatusEl = document.getElementById('bookStatus') || document.getElementById('riderStatus');

  const drivers = [];
  let simInterval = null;
  let activeRide = null;

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function now(){ return new Date().toLocaleTimeString(); }

  function logEvent(text){
    if(!eventLogEl) return;
    const row = document.createElement('div');
    row.style.fontSize='13px';
    row.style.marginBottom='6px';
    row.textContent = `[${now()}] ${text}`;
    eventLogEl.prepend(row);
  }

  function createDrivers(){
    drivers.length = 0;
    for(let i=0;i<DRIVER_COUNT;i++){
      drivers.push({ id:i+1, x:rand(12,88), y:rand(14,86), status:'available', speed:rand(0.3,1.4) });
    }
  }

  function renderMarkers(){
    if(!mapEl) return;
    mapEl.querySelectorAll('.marker').forEach(n=>n.remove());
    drivers.forEach(d=>{
      const m = createMarker(d.id, 'driver', d.x, d.y);
      if(d.status === 'available') m.classList.add('available');
      mapEl.appendChild(m);
    });
    if(!mapEl.querySelector('.marker.rider')){
      const r = createMarker('R', 'rider', MAP_CENTER.x, MAP_CENTER.y);
      mapEl.appendChild(r);
    }
  }

  function renderDriverList(){
    if(!driverListEl) return;
    driverListEl.innerHTML = '';
    drivers.forEach(d=>{
      const item = document.createElement('div');
      item.className = 'driver-item';
      const dist = distanceToRider(d);
      item.innerHTML = `<div>Driver ${d.id}</div><div>${Math.round(dist)} m</div>`;
      driverListEl.appendChild(item);
    });
  }

  function distanceToRider(d){
    const dx = d.x - MAP_CENTER.x;
    const dy = d.y - MAP_CENTER.y;
    const pct = Math.sqrt(dx*dx + dy*dy);
    return pct * 20.0;
  }

  function stepDrivers(){
    drivers.forEach(d=>{
      d.x = clamp(d.x + rand(-1.2,1.2)*d.speed, 3, 96);
      d.y = clamp(d.y + rand(-1.2,1.2)*d.speed, 3, 96);
    });
    renderMarkers();
    renderDriverList();
    logEvent('Drivers updated positions');
  }

  function startSimulation(){
    if(simInterval) return;
    simInterval = setInterval(stepDrivers, UPDATE_MS);
    logEvent('Simulation started');
  }
  function stopSimulation(){
    if(!simInterval) return;
    clearInterval(simInterval); simInterval = null;
    logEvent('Simulation stopped');
  }

  function requestRideDemo(onProgress){
    if(activeRide) return { success:false, message:'A ride is already active.' };
    const available = drivers.filter(d=>d.status==='available');
    if(available.length===0) return { success:false, message:'No drivers available.' };
    available.sort((a,b)=> distanceToRider(a)-distanceToRider(b));
    const chosen = available[0];
    chosen.status = 'assigned';
    activeRide = { driverId: chosen.id, start: Date.now() };
    logEvent(`Ride requested — Driver ${chosen.id} assigned`);
    const steps = 40; let step = 0;
    const startX = chosen.x, startY = chosen.y, targetX = MAP_CENTER.x, targetY = MAP_CENTER.y;
    const anim = setInterval(()=>{
      step++;
      chosen.x = startX + (targetX - startX) * (step/steps);
      chosen.y = startY + (targetY - startY) * (step/steps);
      renderMarkers(); renderDriverList();
      if(onProgress) onProgress({ stage:'moving', progress: step/steps, driverId: chosen.id });
      if(step>=steps){
        clearInterval(anim);
        chosen.status = 'busy';
        logEvent(`Driver ${chosen.id} arrived and trip started`);
        if(onProgress) onProgress({ stage:'arrived', driverId: chosen.id });
        setTimeout(()=>{
          chosen.status = 'available';
          activeRide = null;
          renderMarkers(); renderDriverList();
          logEvent(`Trip complete with Driver ${chosen.id}`);
          if(onProgress) onProgress({ stage:'complete', driverId: chosen.id });
        }, 2000);
      }
    }, 90);
    return { success:true, driverId: chosen.id };
  }

  window.Sim = {
    init(opts = {}){ createDrivers(); renderMarkers(); renderDriverList(); if(opts.startSim) startSimulation(); logEvent('Sim initialized'); },
    start: startSimulation,
    stop: stopSimulation,
    requestRide: requestRideDemo,
    getDrivers: ()=>drivers,
    isRunning: ()=> !!simInterval
  };

  // Auto-bind small UI if present
  if(document.getElementById('requestRide')){
    Sim.init({ startSim:true });
    document.getElementById('requestRide').addEventListener('click', ()=>{
      const status = document.getElementById('bookStatus');
      status.textContent = 'Searching for nearest driver...';
      const res = Sim.requestRide((evt)=>{
        if(evt.stage === 'moving') status.textContent = `Driver ${evt.driverId} is ${Math.round(evt.progress*100)}% on the way...`;
        if(evt.stage === 'arrived') status.textContent = `Driver ${evt.driverId} arrived — trip started`;
        if(evt.stage === 'complete') status.textContent = `Trip complete — Driver ${evt.driverId}`;
      });
      if(!res.success) status.textContent = res.message;
    });
  }

  if(document.getElementById('simulateDriverBtn')){
    const btn = document.getElementById('simulateDriverBtn');
    btn.addEventListener('click', ()=>{
      if(Sim.isRunning()){ Sim.stop(); btn.textContent = 'Start Driver Simulation'; }
      else { Sim.start(); btn.textContent = 'Stop Driver Simulation'; }
    });
  }

  document.querySelectorAll('#logoutBtn').forEach(b=> b.addEventListener('click', ()=> Sim.stop() ));

  if(mapEl && !Sim.isRunning()) Sim.init({ startSim:true });

})();

// Simple in-browser simulation for drivers
window.Sim = (function(){
  let mapEl, drivers=[], timer=null, running=false;
  function rand(n){return Math.random()*n}
  function makeDrivers(n){ drivers = []; for(let i=1;i<=n;i++){ drivers.push({id:'D'+i,x:rand(100),y:rand(100),speed:0.2}); } }
  function clearMarkers(){ if(!mapEl) return; Array.from(mapEl.querySelectorAll('.marker')).forEach(el=>el.remove()); }
  function render(){ if(!mapEl) return; clearMarkers(); drivers.forEach(d=>{ const m=createMarker(d.id,'driver',d.x,d.y); mapEl.appendChild(m); }); }
  function step(){ drivers.forEach(d=>{ // wander
    d.x += (Math.random()-0.5)*d.speed; d.y += (Math.random()-0.5)*d.speed; d.x=Math.max(1,Math.min(99,d.x)); d.y=Math.max(1,Math.min(99,d.y));
  }); render(); }
  function findNearest(xPct,yPct){ let best=null,bd=9e9; drivers.forEach(d=>{ const dx=d.x-xPct, dy=d.y-yPct, dist=dx*dx+dy*dy; if(dist<bd){bd=dist;best=d;} }); return best; }
  function moveDriverTo(driver,tx,ty,done){ const steps=60; let i=0; const sx=driver.x, sy=driver.y; const intv = setInterval(()=>{ i++; driver.x = sx + (tx-sx)*(i/steps); driver.y = sy + (ty-sy)*(i/steps); render(); if(i>=steps){ clearInterval(intv); if(done) done(driver); } },20);
  }
  return {
    init(el){ mapEl = el; },
    start(){ if(running) return; makeDrivers(10); running=true; timer = setInterval(step,600); render(); },
    stop(){ if(!running) return; running=false; clearInterval(timer); timer=null; clearMarkers(); },
    isRunning(){ return running; },
    getDrivers(){ return drivers; },
    requestRide(px,py,cb){ const drv = findNearest(px,py); if(!drv) return cb && cb(null); moveDriverTo(drv,px,py,()=>{ cb && cb(drv); }); }
  };
})();
