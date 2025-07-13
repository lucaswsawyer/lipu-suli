
let articles = [];

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
});

function displayArticles(source) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  const filtered = articles.filter(a => a.publisher === source);

  filtered.forEach(a => {
    const div = document.createElement("div");
    div.className = "article";
    div.innerHTML = `
      <h2>${a.title}</h2>
      <p>${a.summary}</p>
      <a href="${a.file}">lukin e mute</a>
    `;
    container.appendChild(div);
  });
}
