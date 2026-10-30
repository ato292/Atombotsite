// Basit scroll-reveal + sayaç animasyonu. Harici kütüphane yok.
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && els.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  // İstatistik sayaçları (sadece sayısal değerler: "8", "90+", "7/24" gibi karışıkları atla)
  document.querySelectorAll('.stat b[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    let started = false;
    const run = () => {
      if (started) return; started = true;
      const dur = 900, t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { run(); io2.unobserve(e.target); } });
      }, { threshold: 0.4 });
      io2.observe(el);
    } else run();
  });

  // Canlı bot durumu kartı: status.json varsa oradan okur (bot tarafından periyodik
  // güncellenebilir), yoksa yine de gerçek zamanlı saat gösterip "Çevrimiçi" varsayar.
  const clockEl = document.getElementById('statusClock');
  if (clockEl) {
    const tick = () => { clockEl.textContent = new Date().toLocaleTimeString('tr-TR'); };
    tick(); setInterval(tick, 1000);

    const dot = document.getElementById('statusDot');
    const txt = document.getElementById('statusText');
    const mPing = document.getElementById('mPing');
    const mServers = document.getElementById('mServers');
    const mUptime = document.getElementById('mUptime');

    const applyStatus = (d) => {
      const online = d.online !== false;
      dot.classList.toggle('off', !online);
      txt.textContent = online ? 'Çevrimiçi' : 'Çevrimdışı';
      if (d.ping != null) mPing.textContent = d.ping + ' ms';
      if (d.servers != null) mServers.textContent = d.servers;
      if (d.uptime) mUptime.textContent = d.uptime;
    };

    fetch('status.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(applyStatus)
      .catch(() => { /* status.json yok/erişilemiyor — varsayılan "Çevrimiçi" görünümü kalır */ });
  }
});
