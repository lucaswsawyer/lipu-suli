// PWA install prompt
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  let deferredPrompt = e;
  const installBtn = document.getElementById('install-btn');
  installBtn.style.display = 'inline-block';
  installBtn.onclick = () => deferredPrompt.prompt();
});

fetch('articles-index.json').then(res => res.json()).then(data => {
  const articlesList = document.getElementById('articles-list');
  articlesList.innerHTML = '';

  data.forEach(article => {
    const src = article.publisher.toLowerCase().replace(/^the\s+/i, '').trim();
    const li = document.createElement('li');
    li.className = 'articles-list-item';
    li.dataset.source = src;

    li.innerHTML = `
      <div class="article-title">${article.title}</div>
      <div class="article-summary">${article.summary}</div>
      <div class="article-actions">
        <a href="${article.file}">o lukin e lipu →</a>
        <button onclick="saveArticle('${article.file}')">💾 o awen e lipu</button>
      </div>
    `;
    articlesList.appendChild(li);
  });

  document.querySelectorAll('.source-tabs button').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.source-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const chosen = btn.dataset.source;
      articlesList.querySelectorAll('li').forEach(li => {
        li.style.display = (li.dataset.source === chosen) ? '' : 'none';
      });
    };
  });

  document.querySelector('.source-tabs button.active').click();
});

function saveArticle(url) {
  caches.open('lipu-suli').then(cache => {
    cache.add(url).then(() => alert('lipu li awen lon ilo sina!'))
      .catch(() => alert('lipu li pakala tan ni: awen ala.'));
  });
}

// Dark mode toggle
const darkToggle = document.getElementById('dark-mode-toggle');
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}
darkToggle.onclick = () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
};

// Service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
