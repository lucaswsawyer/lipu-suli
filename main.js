let articles = [];
let saved = JSON.parse(localStorage.getItem("readLater") || "[]");

document.addEventListener("DOMContentLoaded", () => {
  // 1) Load articles.json
  fetch("articles.json")
    .then(res => res.json())
    .then(data => {
      articles = data;
      displayArticles("Guardian"); // default tab
    });

  // 2) Source tabs (Guardian / BBC / Reuters / CNN)
  document.querySelectorAll("#source-tabs .tab").forEach(tab => {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      displayArticles(this.dataset.source);
    });
  });

  // 3) Bottom nav (Home / Saved / Play)
  document.querySelectorAll(".bottom-nav .nav-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      document.querySelectorAll("main.view").forEach(v => v.style.display = "none");
      document.querySelectorAll(".bottom-nav .nav-link").forEach(l => l.classList.remove("active"));
      const view = document.getElementById(link.dataset.view);
      view.style.display = "block";
      link.classList.add("active");

      if (link.dataset.view === "home-view") {
        displayArticles(document.querySelector("#source-tabs .tab.active").dataset.source);
      }
      if (link.dataset.view === "saved-view") {
        renderSaved();
      }
    });
  });

  // 4) Theme toggle
  document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  // 5) Init Wordle stub
  initWordleStub();
});

function displayArticles(source) {
  const container = document.getElementById("articles");
  container.innerHTML = "";
  articles
    .filter(a => a.publisher === source)
    .forEach(a => {
      const div = document.createElement("div");
      div.className = "article";
      div.innerHTML = `
        <div class="image-placeholder">📰</div>
        <h2>${a.title}</h2>
        <p>${a.summary}</p>
        <time datetime="${a.date}">${new Date(a.date).toLocaleDateString()}</time>
        <a href="${a.file}">lukin e mute</a>
        <button onclick="toggleSave('${a.file}')" class="save-btn">
          ${saved.includes(a.file) ? "weka" : "lukin tenpo kama"}
        </button>
      `;
      container.appendChild(div);
    });
}

function toggleSave(file) {
  const idx = saved.indexOf(file);
  if (idx >= 0) saved.splice(idx, 1);
  else saved.push(file);
  localStorage.setItem("readLater", JSON.stringify(saved));
}

function renderSaved() {
  const section = document.getElementById("read-later");
  section.innerHTML = "";
  if (!saved.length) {
    section.innerHTML = "<p>No saved articles.</p>";
    return;
  }
  saved.forEach(file => {
    const a = articles.find(a => a.file === file);
    if (!a) return;
    const div = document.createElement("div");
    div.className = "article";
    div.innerHTML = `
      <div class="image-placeholder">🔖</div>
      <h2>${a.title}</h2>
      <time datetime="${a.date}">${new Date(a.date).toLocaleDateString()}</time>
      <a href="${a.file}">open</a>
      <button onclick="toggleSave('${a.file}')" class="save-btn">remove</button>
    `;
    section.appendChild(div);
  });
}

function initWordleStub() {
  const grid = document.getElementById("wordle-grid");
  for (let i = 0; i < 30; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    grid.appendChild(tile);
  }
  const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
  const kb = document.getElementById("keyboard");
  keys.forEach(k => {
    const key = document.createElement("div");
    key.className = "key";
    key.textContent = k;
    kb.appendChild(key);
  });
}
