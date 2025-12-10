// rider/js/rider.js
(function(){
  const user = Auth.currentUser();
  if(!user || user.role !== 'rider'){ /* allow demo access but redirect if desired */ }
  document.getElementById('riderName')?.textContent = user ? user.name : 'Guest';
  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ Auth.logout(); location.href='../common/login.html'; });

  // quick request demo
  window.RideDemo = {
    requestRide(btnEl, statusEl){
      btnEl.disabled = true;
      statusEl.textContent = 'Searching for drivers...';
      setTimeout(()=>{
        statusEl.textContent = 'Driver 4 assigned — ETA 3 min (demo)';
        btnEl.disabled = false;
      }, 1200);
    }
  };
})();

// rider page helpers
(function(){
  // basic auth gating done in pages; this file can contain helpers
})();
