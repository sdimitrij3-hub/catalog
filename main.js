const ANIME = [
  {
    id: "aot",
    title: "Attack on Titan",
    year: 2013,
    rating: 9.0,
    status: "finished",
    genres: ["Action", "Drama", "Fantasy"],
    cover: "https://i.pinimg.com/originals/d6/0e/f4/d60ef4e34b04ab24d9a974ff072fa8b2.jpg?nii=t",
    description: "Люди живут за стенами, спасаясь от титанов. Всё меняется, когда стены падают."
  },
  {
    id: "dn",
    title: "Death Note",
    year: 2006,
    rating: 8.6,
    status: "finished",
    genres: ["Mystery", "Thriller"],
    cover: "https://i0.wp.com/image.tmdb.org/t/p/w300/qDhbGqjZ7yFwa7FMIzuiQTQMfEQ.jpg?resize=300,450",
    description: "Тетрадь смерти даёт власть над жизнью. Игра разума между Лайтом и L."
  },
  {
    id: "mtjbr",
    title: "Mushoku Tensei: Jobless Reincarnation",
    year: 2018,
    rating: 8.3,
    status: "ongoing",
    genres: ["Action", "Comedy"],
    cover: "https://avatars.mds.yandex.net/get-entity_search/2028178/479031868/S600xU_2x",
    description: "30 летний хика переродился в другом мире с магией и мечами."
  },
  {
    id: "frieren",
    title: "Frieren: Beyond Journey's End",
    year: 2023,
    rating: 9.1,
    status: "ongoing",
    genres: ["Adventure", "Fantasy", "Drama"],
    cover: "https://avatars.mds.yandex.net/i?id=f06416a73542a5457697ae37d971574976f1b48c-4820979-images-thumbs&n=13",
    description: "Эльфийка Фрирен переживает время иначе и учится ценить моменты после финала приключения."
  }
];

// DOM: берём элементы со страницы
const gridEl = document.querySelector("#grid");
const emptyEl = document.querySelector("#empty");
const searchInput = document.querySelector("#searchInput");
const genreSelect = document.querySelector("#genreSelect");
const favOnly = document.querySelector("#favOnly");

const modal = document.querySelector("#modal");
const modalBody = document.querySelector("#modalBody");
const modalClose = document.querySelector("#modalClose");

function loadFavorites() {
  const raw = localStorage.getItem("favorites");
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveFavorites(favsSet) {
  const arr = Array.from(favsSet);
  localStorage.setItem("favorites", JSON.stringify(arr));
}

let favorites = loadFavorites();

function uniqGenres(items) {
  const set = new Set();
  for (const a of items) {
    for (const g of a.genres) set.add(g);
  }
  return Array.from(set).sort();
}

function renderGenres() {
  const genres = uniqGenres(ANIME);
  for (const g of genres) {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    genreSelect.append(opt);
  }
}

function matchesFilters(anime) {
  const q = searchInput.value.trim().toLowerCase();
  const genre = genreSelect.value;
  const onlyFav = favOnly.checked;

  const titleOk = q === "" || anime.title.toLowerCase().includes(q);
  const genreOk = genre === "all" || anime.genres.includes(genre);
  const favOk = !onlyFav || favorites.has(anime.id);

  return titleOk && genreOk && favOk;
}

function animeCard(anime) {
  const isFav = favorites.has(anime.id);

  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = anime.id;

  card.innerHTML = `
  <div class="card__media">
    <img class="card__cover" alt="" src="${anime.cover}">
  </div>
  <div class="card__body">
      <h3 class="card__title">${anime.title}</h3>
      <div class="card__meta">
        <span class="badge">${anime.year}</span>
        <span class="badge">⭐ ${anime.rating}</span>
        <span class="badge">${anime.status}</span>
      </div>
      <div class="card__actions">
        <button class="btn" data-action="details">Подробнее</button>
        <button class="iconbtn" data-action="fav">${isFav ? "★" : "☆"}</button>
      </div>
    </div>
  `;

  return card;
}

function renderGrid() {
  gridEl.innerHTML = "";

  const visible = ANIME.filter(matchesFilters);

  for (const a of visible) {
    gridEl.append(animeCard(a));
  }

  emptyEl.classList.toggle("hidden", visible.length !== 0);
}

function openModal(anime) {
  modalBody.innerHTML = `
    <img alt="" src="${anime.cover}">
    <div>
      <h2>${anime.title}</h2>
      <div class="card__meta" style="margin-bottom:10px;">
        <span class="badge">${anime.year}</span>
        <span class="badge">⭐ ${anime.rating}</span>
        <span class="badge">${anime.status}</span>
        <span class="badge">${anime.genres.join(", ")}</span>
      </div>
      <p>${anime.description}</p>
    </div>
  `;
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

function toggleFavorite(id) {
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);

  saveFavorites(favorites);
  renderGrid();
}

// События фильтров
searchInput.addEventListener("input", renderGrid);
genreSelect.addEventListener("change", renderGrid);
favOnly.addEventListener("change", renderGrid);

// Делегирование кликов по карточкам (один обработчик на всю сетку)
gridEl.addEventListener("click", (event) => {
  const actionBtn = event.target.closest("[data-action]");
  if (!actionBtn) return;

  const card = event.target.closest(".card");
  if (!card) return;

  const id = card.dataset.id;
  const anime = ANIME.find(a => a.id === id);
  if (!anime) return;

  const action = actionBtn.dataset.action;

  if (action === "details") openModal(anime);
  if (action === "fav") toggleFavorite(id);
});

// Закрытие модалки
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target.dataset.close === "1") closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

// Инициализация
renderGenres();
renderGrid();
