let articles = [];
let saved = JSON.parse(localStorage.getItem("readLater") || "[]");

document.addEventListener("DOMContentLoaded", () => {
  // Load article list
  fetch("articles.json")
    .then(res => res.json())
    .then(data => {
      articles = data;
      displayArticles("NYT");
    });

  // Tab navigation
  document.querySelectorAll("#source-tabs .tab").forEach(tab => {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      this.classList.add("active");
      displayArticles(this.dataset.source);
    });
  });

  // Theme toggle on index
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  });
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  }

  // Pre-cache saved articles for offline
  if ("caches" in window) {
    caches.open("lipu-cache").then(cache => {
      for (const file of saved) {
        cache.match(file).then(resp => {
          if (!resp) cache.add(file);
        });
      }
    });
  }
});

function displayArticles(source) {
  const container = document.getElementById("articles");
  container.innerHTML = "";
  const filtered = articles.filter(a => a.publisher === source);
  for (const a of filtered) {
    const isSaved = saved.includes(a.file);
    const div = document.createElement("div");
    div.className = "article";
    div.innerHTML = `
      <h2>${a.title}</h2>
      <p>${a.summary}</p>
      <a href="${a.file}">lukin e mute</a>
      <button onclick="toggleSave('${a.file}')" class="save-btn">
        ${isSaved ? "weka" : "lukin tenpo kama"}
      </button>
    `;
    container.appendChild(div);
  }
  renderSaved();
}

function toggleSave(file) {
  const idx = saved.indexOf(file);
  if (idx > -1) {
    saved.splice(idx, 1);
  } else {
    saved.push(file);
    // Cache the article page for offline
    if ("caches" in window) {
      caches.open("lipu-cache").then(cache => cache.add(file));
    }
  }
  localStorage.setItem("readLater", JSON.stringify(saved));
  // Re-render list
  const active = document.querySelector(".tab.active").dataset.source;
  displayArticles(active);
}

function renderSaved() {
  const sec = document.getElementById("read-later");
  if (!saved.length) {
    sec.innerHTML = "";
    return;
  }
  // Build a list showing article titles (not "${f}")
  let html = "<h3>lipu pi lukin kama</h3><ul>";
  for (const file of saved) {
    const art = articles.find(a => a.file === file);
    const title = art ? art.title : file;
    html += `
      <li>
        <a href="${file}">${title}</a>
        <button onclick="toggleSave('${file}')">weka</button>
      </li>
    `;
  }
  html += "</ul>";
  sec.innerHTML = html;
}
