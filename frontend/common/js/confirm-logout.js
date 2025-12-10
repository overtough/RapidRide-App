// confirm-logout.js
// Adds a modal confirmation when logout is triggered. Looks for common logout selectors
(function(){
  function createModal(){
    if(document.getElementById('rr-logout-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'rr-logout-modal';
    modal.className = 'rr-modal-backdrop';
    modal.innerHTML = `
      <div class="glass-card rr-modal-content slide-up" role="dialog" aria-modal="true">
        <h3 style="margin-bottom: 0.5rem;">Confirm Logout</h3>
        <p style="margin-bottom: 1.5rem; color: var(--text-muted);">Are you sure you want to end your session?</p>
        <div class="flex-center gap-2" style="justify-content: flex-end;">
          <button class="btn btn-secondary rr-cancel">Cancel</button>
          <button class="btn btn-danger rr-confirm">Logout</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // minimal styles for positioning, visual styles come from global.css
    const style = document.createElement('style');
    style.textContent = `
      .rr-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: none; /* hidden by default */
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .rr-modal-content {
        width: 90%;
        max-width: 400px;
        text-align: left;
      }
    `;
    document.head.appendChild(style);
    
    // attach handlers
    modal.querySelector('.rr-cancel').addEventListener('click', hideModal);
    modal.querySelector('.rr-confirm').addEventListener('click', doLogout);
    modal.addEventListener('click', function(e){ if(e.target === modal) hideModal(); });

    // expose programmatic API for other scripts
    window.RRLogout = {
      showModal: showModal,
      hideModal: hideModal,
      doLogout: doLogout
    };
  }

  function showModal(){
    createModal();
    const modal = document.getElementById('rr-logout-modal');
    if(modal) {
      modal.style.display = 'flex'; // flex to center content
      // Add animation class if needed, though 'slide-up' is on content
    }
    // focus the logout button for keyboard users
    const confirm = modal && modal.querySelector('.rr-confirm');
    if(confirm) confirm.focus();
  }
  
  function hideModal(){
    const modal = document.getElementById('rr-logout-modal');
    if(modal) modal.style.display = 'none';
  }

  // Try candidate URLs and redirect to the first reachable one to avoid "Cannot GET /index.html" errors
  async function redirectToIndexSafe(){
    const candidates = [];
    // Build relative candidates by climbing up to 5 levels from current path
    for(let i=0;i<=5;i++){
      const prefix = Array(i).fill('..').join('/') || '.';
      candidates.push(prefix + '/index.html');
    }
    // Also try absolute and origin-based paths
    if(window.location.origin && window.location.origin !== 'null') candidates.unshift(window.location.origin + '/index.html');
    candidates.push('/index.html');

    for(const c of candidates){
      try{
        // Try fetching the candidate to verify it exists and is reachable.
        const resp = await fetch(c, { method: 'GET', cache: 'no-store' });
        if(resp && resp.ok){ window.location.href = c; return; }
      }catch(e){ /* ignore network errors and try next */ }
    }
    // As a last resort, navigate to a relative index (may produce 404 if not served)
    window.location.href = 'index.html';
  }

  async function doLogout(){
    try{ await Auth.logout(); }catch(e){}
    hideModal();
    await redirectToIndexSafe();
  }

  function attach(){
    // selectors that represent logout controls
    const selectors = ['#logout','#logoutBtn','button.logout','#logout-link','.logout'];
    const els = [];
    selectors.forEach(s => { document.querySelectorAll(s).forEach(e => els.push(e)); });
    // dedupe
    const unique = Array.from(new Set(els));
    unique.forEach(el => {
      // avoid attaching twice
      if(el.dataset.rrLogout) return; el.dataset.rrLogout = '1';
      el.addEventListener('click', function(e){
        e.preventDefault();
        showModal();
      });
      // allow keyboard activation (Enter) when element is focused
      el.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.keyCode === 13){ e.preventDefault(); showModal(); }
      });
    });
  }

  // Global key handling for the modal: Enter confirms, Escape cancels
  document.addEventListener('keydown', function(e){
    const modal = document.getElementById('rr-logout-modal');
    if(!modal || modal.style.display === 'none') return;
    if(e.key === 'Escape' || e.keyCode === 27){ e.preventDefault(); hideModal(); }
    else if(e.key === 'Enter' || e.keyCode === 13){ e.preventDefault(); // trigger confirm
      const confirmBtn = modal.querySelector('.rr-confirm');
      if(confirmBtn) confirmBtn.click();
    }
  });

  // initialize on DOM ready and when new elements may be added
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
  // also observe mutations to attach to dynamically added logout controls
  const obs = new MutationObserver(function(){ attach(); });
  obs.observe(document.body, { childList:true, subtree:true });
})();