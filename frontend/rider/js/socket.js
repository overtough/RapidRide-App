// rider/js/socket.js
// Minimal stub socket for demo
window.RiderSocket = (function(){
  const listeners = {};
  return {
    on(ev,fn){ (listeners[ev]=listeners[ev]||[]).push(fn); },
    emit(ev,payload){ // notify local listeners
      (listeners[ev]||[]).forEach(f=>setTimeout(()=>f(payload),0));
    },
    _trigger(ev,payload){ this.emit(ev,payload); }
  };
})();
