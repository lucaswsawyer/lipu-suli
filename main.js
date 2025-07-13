
let articles = [];
let saved = JSON.parse(localStorage.getItem("readLater") || "[]");

document.addEventListener("DOMContentLoaded", () => {
  fetch("articles.json")
    .then(res => res.json())
    .then(data => {
      articles = data;
      displayArticles("NYT");
    });

  document.querySelectorAll("#source-tabs .tab").forEach(tab => {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      displayArticles(this.dataset.source);
    });
  });

  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  // Pre-cache saved articles
  if ('caches' in window) {
    caches.open('lipu-cache').then(cache => {
      saved.forEach(file => {
        cache.match(file).then(resp => {
          if (!resp) cache.add(file);
        });
      });
    });
  }
});

function displayArticles(source) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  const filtered = articles.filter(a => a.publisher === source);

  filtered.forEach(a => {
    const div = document.createElement("div");
    div.className = "article";
    const savedAlready = saved.includes(a.file);
    div.innerHTML = `
      <h2>${a.title}</h2>
      <p>${a.summary}</p>
      <a href="${a.file}">lukin e mute</a>
      <button onclick="toggleSave('${a.file}')" class="save-btn">
        ${savedAlready ? '🔖 Remove' : '🔖 Read later'}
      </button>
    `;
    container.appendChild(div);
  });

  renderSaved();
}

function toggleSave(file) {
  const idx = saved.indexOf(file);
  if (idx > -1) {
    saved.splice(idx, 1);
  } else {
    saved.push(file);
    // Cache article
    if ('caches' in window) {
      caches.open('lipu-cache').then(cache => cache.add(file));
    }
  }
  localStorage.setItem("readLater", JSON.stringify(saved));
  displayArticles(document.querySelector(".tab.active").dataset.source);
}

function renderSaved() {
  const sec = document.getElementById("read-later");
  if (!saved.length) {
    sec.innerHTML = "";
    return;
  }

  sec.innerHTML = "<h3>lipu pi lukin kama</h3><ul>" + saved.map(f =>
    `<li><a href="${f}">${f}</a> <button onclick="toggleSave('${f}')">❌</button></li>`
  ).join("") + "</ul>";
}
