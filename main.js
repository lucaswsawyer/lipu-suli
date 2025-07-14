// PWA install prompt handler
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

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

// Common: date, manifest version, dark-mode toggle
(async function () {
  // Date under title
  const dateEl = document.getElementById('page-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  // Version check
  try {
    const mf = await fetch('manifest.json');
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

  // Dark mode toggle
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
})();

// Load articles on Home page
(function () {
  const ul = document.getElementById('articles-list');
  if (!ul) return;

  (async () => {
    try {
      const resp = await fetch('articles/articles.json');
      const files = await resp.json();
      let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');

      for (const file of files) {
        const txt = await fetch(`articles/${file}`).then(r => r.text());
        const parser = new DOMParser();
        const doc = parser.parseFromString(txt, 'text/html');
        const title = doc.querySelector('h1')?.textContent || file;

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `articles/${file}`;
        a.textContent = title;

        const btn = document.createElement('button');
        btn.textContent = saved.includes(file) ? '✓ Saved' : '💾 Save';
        btn.onclick = () => {
          if (!saved.includes(file)) {
            saved.push(file);
            localStorage.setItem('savedArticles', JSON.stringify(saved));
            navigator.serviceWorker.controller?.postMessage({ action: 'save-article', url: `articles/${file}` });
            btn.textContent = '✓ Saved';
          }
        };

        li.append(a, ' ', btn);
        ul.appendChild(li);
      }
    } catch (e) {
      console.error('Error loading articles', e);
    }
  })();
})();

// Build Saved list
(function () {
  const ul = document.getElementById('saved-list');
  if (!ul) return;

  let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
  if (!saved.length) {
    ul.innerHTML = '<li>sina ala jo e lipu mani.</li>';
    return;
  }

  for (const file of saved) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `articles/${file}`;
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
  }
})();
