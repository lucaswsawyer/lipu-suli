// Handle PWA install prompt
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
      console.log('Install result:', outcome);
      deferredPrompt = null;
    });
  }
});

// Register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// Common initialization: date, version check, dark-mode toggle
(async function () {
  // Date under title
  const dateEl = document.getElementById('page-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  // Version check against manifest
  try {
    const mf = await fetch('/manifest.json');
    const { version } = await mf.json();
    const old = localStorage.getItem('appVersion');
    if (old !== version) {
      localStorage.setItem('appVersion', version);
      if (location.pathname.endsWith('index.html') || location.pathname === '/') {
        location.reload(true);
      }
    }
  } catch (err) {
    console.warn('Manifest check failed', err);
  }

  // Dark mode
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

// Load and display articles on the Home page
(function () {
  const ul = document.getElementById('articles-list');
  if (!ul) return;  // not on Home page

  (async () => {
    try {
      const resp = await fetch('/articles/articles.json');
      const files = await resp.json();
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
        btn.dataset.url = `/articles/${file}`;
        btn.onclick = () => {
          if (!saved.includes(file)) {
            saved.push(file);
            localStorage.setItem('savedArticles', JSON.stringify(saved));
            btn.textContent = '✓ Saved';
            navigator.serviceWorker.controller?.postMessage({ action: 'save-article', url: btn.dataset.url });
          }
        };

        li.append(a, ' ', btn);
        ul.appendChild(li);
      }
    } catch (e) {
      console.error('Error loading articles:', e);
    }
  })();
})();

// Build the Saved page list
(function () {
  const ul = document.getElementById('saved-list');
  if (!ul) return;  // not on Saved page

  let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
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
