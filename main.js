// Register Service Worker and check manifest version + handle date & dark mode
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

(async function(){
  // date under title
  document.getElementById('page-date').textContent =
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // manifest version check
  try {
    const mf = await fetch('/manifest.json');
    const { version } = await mf.json();
    const old = localStorage.getItem('appVersion');
    if (old !== version) {
      localStorage.setItem('appVersion', version);
      if (location.pathname === '/index.html') {
        location.reload(true);
      }
    }
  } catch(e){
    console.warn('version check failed', e);
  }

  // dark mode toggle
  const toggle = document.getElementById('dark-mode-toggle');
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
})();