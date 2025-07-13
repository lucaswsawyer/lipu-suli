// PWA install prompt handling
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener('click', async () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt result:', outcome);
      deferredPrompt = null;
    });
  }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// Common: date under title + dark-mode toggle + version check
(async function () {
  // date
  const dateEl = document.getElementById('page-date');
  if (dateEl) {
    dateEl.textContent =
      new Date().toLocaleDateString('en-US',
        { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // manifest version check
  try {
    const mf = await fetch('/manifest.json');
    const { version } = await mf.json();
    const old = localStorage.getItem('appVersion');
    if (old !== version) {
      localStorage.setItem('appVersion', version);
      if (location.pathname === '/index.html') location.reload(true);
    }
  } catch (e) {
    console.warn('version check failed', e);
  }

  // dark-mode toggle
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
})();

// Home page: load articles + Save buttons
if (location.pathname.endsWith('index.html') || location.pathname === '/') {
  (async function () {
    const resp = await fetch('/articles/articles.json');
    const files = await resp.json();
    const ul = document.getElementById('articles-list');
    let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');

    for (const file of files) {
      const txt = await fetch(`/articles/${file}`).then(r => r.text());
      const doc = new DOMParser().parseFromString(txt, 'text/html');
      const title = doc.querySelector('h1')?.textContent || file;

      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `/articles/${file}`;
      a.textContent = title;

      const btn = document.createElement('button');
      btn.textContent = saved.includes(file) ? '✓ Saved' : '💾 Save';
      btn.className = 'save-btn';
      btn.dataset.url = `/articles/${file}`;
      btn.onclick = () => {
        if (!saved.includes(file)) {
          saved.push(file);
          localStorage.setItem('savedArticles', JSON.stringify(saved));
          btn.textContent = '✓ Saved';
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              action: 'save-article',
              url: btn.dataset.url
            });
          }
        }
      };

      li.append(a, ' ', btn);
      ul.appendChild(li);
    }
  })();
}

// Saved page: list offline copies + remove buttons
if (location.pathname.endsWith('saved.html')) {
  (function () {
    let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
    const ul = document.getElementById('saved-list');

    if (saved.length === 0) {
      ul.innerHTML = '<li>sina ala jo e lipu mani.</li>';
      return;
    }

    saved.forEach(file => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = file;
      a.textContent = file.replace('.html', '').replace(/_/g, ' ');
      const btn = document.createElement('button');
      btn.textContent = '🗑️ Remove';
      btn.onclick = () => {
        saved = saved.filter(f => f !== file);
        localStorage.setItem('savedArticles', JSON.stringify(saved));
        li.remove();
      };
      li.append(a, ' ', btn);
      ul.appendChild(li);
    });
  })();
}
