const countryName = new URLSearchParams(location.search).get("name");
const flagImage = document.getElementById("flagImage");
const countryHead = document.getElementById("countryHead");
const population = document.getElementById("population");
const region = document.getElementById("region");
const area = document.getElementById("area");
const topLevelDomain = document.getElementById("topLevelDomain");
const capital = document.getElementById("capital");
const currencies = document.getElementById("currencies");
const languages = document.getElementById("languages");
const favoriteToggle = document.getElementById("favoriteToggle");

// Toggle favorite for the current country
function toggleFavorite() {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.includes(countryName)) {
    favorites = favorites.filter((fav) => fav !== countryName);
  } else if (favorites.length < 6) {
    favorites.push(countryName);
    showConfirmationMessage();
  } else {
    alert("You can only have up to 5 favorite countries.");
    return;
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoriteIcon();
}

// Update favorite icon based on current favorites
function updateFavoriteIcon() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favorites.includes(countryName)) {
    favoriteToggle.querySelector("i").classList.add("active");
    favoriteToggle.querySelector("span").textContent = "Remove from Favorite";
  } else {
    favoriteToggle.querySelector("i").classList.remove("active");
    favoriteToggle.querySelector("span").textContent = "Add to Favorite";
  }
}

// Initialize favorite icon and add click listener for toggle
updateFavoriteIcon();
favoriteToggle.addEventListener("click", (e) => {
  e.preventDefault();
  toggleFavorite();
});

// Show a confirmation message on favorite addition
function showConfirmationMessage() {
  const confirmationMessage = document.createElement("div");
  confirmationMessage.id = "confirmationMessage";
  confirmationMessage.textContent = "Your country has been saved to favorites!";
  document.body.appendChild(confirmationMessage);

  setTimeout(() => {
    confirmationMessage.remove();
  }, 2000);
}

// Fetch and display country details
fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
  .then((res) => res.json())
  .then(([country]) => {
    flagImage.src = country.flags.svg;
    countryHead.innerText = country.name.common;
    population.innerText = country.population.toLocaleString("en-IN");
    region.innerText = country.region;
    area.innerText = country.area.toLocaleString("en-IN");
    topLevelDomain.innerText = country.tld.join(", ");
    capital.innerText = country.capital ? country.capital[0] : "N/A";
    currencies.innerText = Object.values(country.currencies || {})
      .map((currency) => currency.name)
      .join(", ");
    languages.innerText = Object.values(country.languages || {}).join(", ");

    updateFavoriteIcon();
  });
