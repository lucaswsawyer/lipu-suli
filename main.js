// PWA install prompt
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
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    };
  }
});

// Dark mode toggle persistence
const darkToggle = document.getElementById('dark-mode-toggle');
if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  });
}

// Articles List: render and filter by source
const articlesList = document.getElementById('articles-list');
if (articlesList) {
  fetch('articles-index.json')
    .then(res => res.json())
    .then(data => {
      // Clear any old entries
      articlesList.innerHTML = '';
      data.forEach(article => {
        // Assume "file" is like "articles/bbc_somefile.html"
        let src = article.file.split('/')[1].split('_')[0].toLowerCase(); // e.g. "bbc"
        const li = document.createElement('li');
        li.dataset.source = src;
        li.innerHTML = `<a href="${article.file}">${article.title}</a>`;
        articlesList.appendChild(li);
      });

      // Attach filtering logic after rendering articles
      const tabButtons = document.querySelectorAll('.source-tabs button');
      tabButtons.forEach(btn => {
        btn.onclick = () => {
          tabButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const chosen = btn.dataset.source.toLowerCase();
          articlesList.querySelectorAll('li').forEach(li => {
            li.style.display = (li.dataset.source === chosen) ? '' : 'none';
          });
        };
      });

      // Optionally: Activate the first tab and filter on load
      const firstTab = document.querySelector('.source-tabs button.active');
      if (firstTab) firstTab.click();
    });
}

// Saved Articles List
const savedList = document.getElementById('saved-list');
if (savedList) {
  let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
  if (!saved.length) {
    savedList.innerHTML = '<li>sina ala jo e lipu mani.</li>';
  } else {
    saved.forEach(file => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${file}">${file.replace('.html', '').replace(/_/g, ' ')}</a>`;
      const btn = document.createElement('button');
      btn.textContent = '🗑️ Remove';
      btn.onclick = () => {
        saved = saved.filter(f => f !== file);
        localStorage.setItem('savedArticles', JSON.stringify(saved));
        li.remove();
      };
      li.appendChild(btn);
      savedList.appendChild(li);
    });
  }
}
