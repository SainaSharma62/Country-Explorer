const countriesContainer = document.querySelector(".countries-container");
const regionFilter = document.getElementById("regionFilter");
const languageFilter = document.getElementById("languageFilter");
const searchInput = document.querySelector(".searchinput");
const suggestionsDropdown = document.querySelector(".suggestions-dropdown");
const favoritesContainer = document.getElementById("favoritesContainer");
const favoritesList = document.getElementById("favoritesList");
const resetButton = document.getElementById("resetFilters");
const toggle = document.querySelector(".nav-toggle");

let allCountryData = [];
let filteredCountries = [];
let currentPage = 1;
const countriesPerPage = 20;

// Function to update and display favorites on the main page
function updateFavoritesDisplay() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  
  favoritesList.innerHTML = ""; // Clear previous list

  // Show only up to 5 favorites
  favorites.slice(0, 6).forEach((countryName) => {
    const country = allCountryData.find(
      (item) => item.name.common === countryName
    );
    if (country) {
      const listItem = document.createElement("li");

      // Create a clickable anchor for the country
      const countryLink = document.createElement("a");
      countryLink.classList.add("favorite-country");
      countryLink.href = `country.html?name=${encodeURIComponent(
        countryName
      )}`;
      countryLink.style.display = "inline";
      countryLink.style.alignItems = "center";

      // Country flag
      const flagImg = document.createElement("img");
      flagImg.src = country.flags.svg;
      flagImg.alt = `${countryName} flag`;
      flagImg.style.width = "300px";
      flagImg.style.marginRight = "10px";
      countryLink.appendChild(flagImg);
      countryLink.appendChild(document.createTextNode(countryName));

      // Append the link and an 'unfavorite' button
      listItem.appendChild(countryLink);
      const removeButton = document.createElement("button");
      removeButton.classList.add("remove-button");
      removeButton.textContent = "Remove";
      removeButton.onclick = (e) => {
        e.stopPropagation();
        removeFavorite(countryName);
      };
      listItem.appendChild(removeButton);

      favoritesList.appendChild(listItem);
    }
  });
}

// Function to add a country to favorites
function addFavorite(countryName) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // Check if the country is already in the favorites
  if (!favorites.includes(countryName)) {
    if (favorites.length < 6) {
      // Allow only up to 6 countries
      favorites.push(countryName);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      updateFavoritesDisplay();
    } else {
      alert("You can only add up to 5 favorite countries.");
    }
  } else {
    alert("This country is already in your favorites.");
  }
}

// Remove country from favorites
function removeFavorite(countryName) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter((fav) => fav !== countryName);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesDisplay();
}

// Load filters from local storage
function loadSavedFilters() {
  const savedSearchTerm = localStorage.getItem("searchTerm") || "";
  const savedRegion = localStorage.getItem("region") || "";
  const savedLanguage = localStorage.getItem("language") || "";

  searchInput.value = savedSearchTerm;
  regionFilter.value = savedRegion;
  languageFilter.value = savedLanguage;

  filterAndSearchCountries();
}

// Save filter values to localStorage
function saveFilters() {
  localStorage.setItem("searchTerm", searchInput.value);
  localStorage.setItem("region", regionFilter.value);
  localStorage.setItem("language", languageFilter.value);
}

// Fetch all countries data initially
fetch("https://restcountries.com/v3.1/all")
  .then((res) => res.json())
  .then((data) => {
    allCountryData = data;
    filteredCountries = data;
    loadSavedFilters();
    displayCountries();
    updateFavoritesDisplay();
  });

// Helper function for applying filters and search together
function filterAndSearchCountries() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedRegion = regionFilter.value;
  const selectedLanguage = languageFilter.value;

  filteredCountries = allCountryData.filter((country) => {
    const matchesSearch =
      !searchTerm || country.name.common.toLowerCase().includes(searchTerm);
    const matchesRegion = !selectedRegion || country.region === selectedRegion;
    const matchesLanguage =
      !selectedLanguage ||
      (country.languages &&
        Object.keys(country.languages).some((key) => key === selectedLanguage));

    return matchesSearch && matchesRegion && matchesLanguage;
  });

  displayCountries(true);
  saveFilters();
}

// Region filter event listener
regionFilter.addEventListener("change", (e) => {
  if (e.target.value) {
    languageFilter.value = "";
    languageFilter.disabled = true;
    filterAndSearchCountries();
    setTimeout(() => {
      languageFilter.disabled = false;
    }, 500);
  } else {
    languageFilter.disabled = false;
  }
});

// Language filter event listener
languageFilter.addEventListener("change", (e) => {
  if (e.target.value) {
    regionFilter.value = "";
    regionFilter.disabled = true;
    filterAndSearchCountries();
    setTimeout(() => {
      regionFilter.disabled = false;
    }, 500);
  } else {
    regionFilter.disabled = false;
  }
});

// Search input event listener
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  if (searchTerm) {
    showSuggestions(searchTerm);
  } else {
    suggestionsDropdown.style.display = "none";
    filterAndSearchCountries();
  }
});

// Show suggestions based on search input
function showSuggestions(searchTerm) {
  suggestionsDropdown.innerHTML = "";
  const suggestions = allCountryData
    .filter((country) => country.name.common.toLowerCase().includes(searchTerm))
    .slice(0, 5);

  suggestions.forEach((country) => {
    const suggestionItem = document.createElement("p");
    suggestionItem.textContent = country.name.common;
    suggestionItem.addEventListener("click", () => {
      searchInput.value = "";
      suggestionsDropdown.style.display = "none";
      filteredCountries = [country];
      displayCountries(true);
    });
    suggestionsDropdown.appendChild(suggestionItem);
  });

  if (suggestions.length > 0) {
    const viewAllButton = document.createElement("button");
    viewAllButton.textContent = "View All";
    viewAllButton.addEventListener("click", () => {
      filterAndSearchCountries();
      searchInput.value = "";
      suggestionsDropdown.style.display = "none";
    });
    suggestionsDropdown.appendChild(viewAllButton);
    suggestionsDropdown.style.display = "block";
  } else {
    suggestionsDropdown.style.display = "none";
  }
}

resetButton.addEventListener("click", () => {
  searchInput.value = "";
  regionFilter.value = "";
  languageFilter.value = "";

  localStorage.removeItem("searchTerm");
  localStorage.removeItem("region");
  localStorage.removeItem("language");

  filteredCountries = allCountryData;
  currentPage = 1;
  displayCountries(true);
});

// Display countries with pagination
function displayCountries(clear = false) {
  if (clear) {
    countriesContainer.innerHTML = "";
    currentPage = 1;
  }

  const start = (currentPage - 1) * countriesPerPage;
  const end = start + countriesPerPage;
  const countriesToShow = filteredCountries.slice(start, end);

  countriesToShow.forEach((country) => {
    const countryCard = document.createElement("a");
    countryCard.classList.add("country-card");
    countryCard.href = `country.html?name=${country.name.common}`;

    countryCard.innerHTML = `
      <img src="${country.flags.svg}" alt="${country.name.common}">
      <div class="details">
        <h3>${country.name.common}</h3>
        <p>Population: ${country.population.toLocaleString("en-IN")}</p>
        <p>Region: ${country.region}</p>
        <p>Area: ${country.area.toLocaleString("en-IN")} km²</p>
      </div>
     
    `;
    countriesContainer.appendChild(countryCard);
  });

  const seeMoreBtn = document.getElementById("seeMoreBtn");
  if (filteredCountries.length > end) {
    seeMoreBtn.style.display = "block";
    seeMoreBtn.onclick = () => {
      currentPage++;
      displayCountries();
    };
  } else {
    seeMoreBtn.style.display = "none";
  }
}

  document.addEventListener("DOMContentLoaded", function () {
  
    toggle.addEventListener("click", function () {
      // Toggle the display of the favorites container
      if (favoritesContainer.style.display === "none" || !favoritesContainer.style.display) {
        favoritesContainer.style.display = "block";
      } else {
        favoritesContainer.style.display = "none";
      }
    });
  });
