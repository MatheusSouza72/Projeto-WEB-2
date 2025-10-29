const pokeContainer = document.querySelector("#pokeContainer");
const pokemonCount = 150;
const colors = {
  fire: '#FDDFDF',
  grass: '#DEFDE0',
  electric: '#FCF7DE',
  water: '#DEF3FD',
  ground: '#f4e7da',
  rock: '#d5d5d4',
  fairy: '#fceaff',
  poison: '#98d7a5',
  bug: '#f8d5a3',
  dragon: '#97b3e6',
  psychic: '#eaeda1',
  flying: '#F5F5F5',
  fighting: '#E6E0D4',
  normal: '#F5F5F5'
};
const mainTypes = Object.keys(colors);
let currentPage = 1;
const pokemonsPerPage = 50;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

const fetchPokemons = async (page = 1) => {
  pokeContainer.innerHTML = "";
  const start = (page - 1) * pokemonsPerPage + 1;
  const end = Math.min(start + pokemonsPerPage - 1, pokemonCount);
  for (let i = start; i <= end; i++) {
    await getPokemon(i);
  }
};

const getPokemon = async (id) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const resp = await fetch(url);
  const data = await resp.json();
  createPokemonCard(data);
};

const createPokemonCard = (poke) => {
  const card = document.createElement("div");
  card.classList.add("pokemon");

  const name = poke.name[0].toUpperCase() + poke.name.slice(1);
  const id = poke.id.toString().padStart(3, "0");
  const pokeTypes = poke.types.map((type) => type.type.name);
  const type = mainTypes.find((type) => pokeTypes.indexOf(type) > -1);
  const color = colors[type];
  card.style.backgroundColor = color;
  const isFavorite = favorites.includes(poke.id);

  const imageUrl = poke.sprites?.other?.['official-artwork']?.front_default
    || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png`
    || `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${poke.id.toString().padStart(3,'0')}.png`;

  card.innerHTML = `
    <div class="imgContainer">
      <img src="${imageUrl}" alt="${name}" onerror="this.onerror=null;this.src='https://assets.pokemon.com/assets/cms2/img/pokedex/full/${poke.id.toString().padStart(3,'0')}.png';" />
    </div>
    <div class="info">
      <span class="number">#${id}</span>
      <h3 class="name">${name}</h3>
      <small class="type">Type: <span>${type}</span></small>
    </div>
    <button class="favBtn">${isFavorite ? "⭐" : "☆"}</button>
  `;

  const favBtn = card.querySelector(".favBtn");
  favBtn.addEventListener("click", () => toggleFavorite(poke.id, favBtn));

  pokeContainer.appendChild(card);
};

function toggleFavorite(id, btn) {
  if (favorites.includes(id)) {
    favorites = favorites.filter((f) => f !== id);
    btn.textContent = "☆";
  } else {
    favorites.push(id);
    btn.textContent = "⭐";
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function showFavorites() {
  pokeContainer.innerHTML = "";
  if (favorites.length === 0) {
    pokeContainer.innerHTML = "<p>Nenhum Pokémon favorito ainda!</p>";
    return;
  }
  favorites.forEach((id) => getPokemon(id));
}

async function searchPokemon() {
  const input = document.getElementById("searchInput");
  const errorMsg = document.getElementById("errorMessage");
  const name = input.value.toLowerCase().trim();
  if (!name) return;
  try {
    const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!resp.ok) throw new Error("not found");
    const data = await resp.json();
    pokeContainer.innerHTML = "";
    createPokemonCard(data);
    errorMsg.style.display = "none";
  } catch (err) {
    errorMsg.style.display = "block";
    pokeContainer.innerHTML = "";
  }
}

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentPage * pokemonsPerPage < pokemonCount) {
    currentPage++;
    fetchPokemons(currentPage);
  }
});

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchPokemons(currentPage);
  }
});

document.getElementById("searchBtn").addEventListener("click", searchPokemon);
document.getElementById("showFavoritesBtn").addEventListener("click", showFavorites);
fetchPokemons();