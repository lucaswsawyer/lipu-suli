// PWA install prompt handler
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('install-btn');
  if (btn) {
    btn.style.display = 'inline-block';
    btn.onclick = async () => {
      btn.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install result:', outcome);
      deferredPrompt = null;
    };
  }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

// Common: date, manifest version check, dark-mode toggle
(async () => {
  const dateEl = document.getElementById('page-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  }
  try {
    const mf = await fetch('manifest.json');
    const { version } = await mf.json();
    const old = localStorage.getItem('appVersion');
    if (old !== version) {
      localStorage.setItem('appVersion', version);
      if (location.pathname === '/index.html' || location.pathname === '/') {
        location.reload(true);
      }
    }
  } catch (e) {
    console.warn('Manifest check failed', e);
  }
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.onclick = () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
  }
})();

// Home page: load & display articles, filter by source, save functionality
(function () {
  const ul = document.getElementById('articles-list');
  if (!ul) return;
  const tabs = document.querySelectorAll('.source-tabs button');
  let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');

  fetch('/articles/articles.json')
    .then(r => r.json())
    .then(files =>
      Promise.all(files.map(file =>
        fetch(`/articles/${file}`)
          .then(r => r.text())
          .then(txt => {
            const doc = new DOMParser().parseFromString(txt, 'text/html');
            return {
              file,
              title: doc.querySelector('h1')?.textContent || file,
              source: file.split('_')[0]
            };
          })
      ))
    )
    .then(items => {
      items.forEach(({ file, title, source }) => {
        const li = document.createElement('li');
        li.dataset.source = source;
        const a = document.createElement('a');
        a.href = `/articles/${file}`;
        a.textContent = title;
        const btn = document.createElement('button');
        btn.textContent = saved.includes(file) ? '✓ Saved' : '💾 Save';
        btn.onclick = () => {
          if (!saved.includes(file)) {
            saved.push(file);
            localStorage.setItem('savedArticles', JSON.stringify(saved));
            navigator.serviceWorker.controller?.postMessage({
              action: 'save-article',
              url: `/articles/${file}`
            });
            btn.textContent = '✓ Saved';
          }
        };
        li.append(a, ' ', btn);
        ul.appendChild(li);
      });

      // Setup tab filtering
      tabs.forEach(btn => {
        btn.onclick = () => {
          tabs.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const src = btn.dataset.source;
          ul.querySelectorAll('li').forEach(li => {
            li.style.display = li.dataset.source === src ? '' : 'none';
          });
        };
      });
    })
    .catch(e => console.error('Error loading articles', e));
})();

// Saved page: list saved articles with remove functionality
(function () {
  const ul = document.getElementById('saved-list');
  if (!ul) return;
  let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
  if (!saved.length) {
    ul.innerHTML = '<li>sina ala jo e lipu mani.</li>';
    return;
  }
  saved.forEach(file => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `/articles/${file}`;
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
