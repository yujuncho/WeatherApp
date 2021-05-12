/**
 * Search weather API by city
 *
 * Set up API key, HTML & CSS layout, JS click events
 *
 * https://ucarecdn.com/add9dea2-e16e-4a3a-8c21-071032c0f674/
 */

/* API CALLS */
let getForecast = function (city, callback) {
  let mapKey = "AAbkWcOD8LbQjF40V04rYRQ1OwvAUGj0";
  let getLocationURL = `https://www.mapquestapi.com/geocoding/v1/address?key=${mapKey}&location=${city}`;

  // TODO: Handle error for when mapquest says a city doesn't exist
  fetch(getLocationURL)
    .then(response => response.json())
    .then(data => {
      let { lat, lng } = data.results[0].locations[0].latLng;
      let weatherKey = "980af6631660d1612310f85f534cac5e";
      let getWeatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&units=imperial&appid=${weatherKey}`;

      fetch(getWeatherURL)
        .then(response => response.json())
        .then(data => {
          callback(data);
        });
    });
};

/* SAVED SEARCHES */
// List of saved names
let savedSearches = JSON.parse(localStorage.getItem("pastSearches")) || [];

let restoreSavedSearches = function (saved) {
  for (let i = saved.length - 1; i >= 0; i--) {
    createSavedSearch(saved[i], true);
  }
  search(saved[0]);
};

/* UPDATE DISPLAY */
let updateCurrent = function (city, current) {
  console.log(current);
  document.getElementById("city").textContent = city;
  document.getElementById("currentDate").textContent = `${new Date(
    current.dt * 1000
  ).toLocaleDateString("en-US")}`;
  document.getElementById(
    "currentIcon"
  ).src = `http://openweathermap.org/img/w/${current.weather[0].icon}.png`;
  document.getElementById("currentTemp").innerHTML = `${current.temp}&#176;F`;
  document.getElementById(
    "currentHumidity"
  ).textContent = `${current.humidity}%`;
  document.getElementById(
    "currentWind"
  ).textContent = `${current.wind_speed} MPH`;
  let currentUVElement = document.getElementById("currentUV");
  currentUVElement.textContent = `${current.uvi}`;
  currentUVElement.className = `py-1 px-2 rounded-sm text-light ${uviColor(
    current.uvi
  )}`;
};

let uviColor = function (uvi) {
  if (uvi <= 2) {
    return "bg-success";
  } else if (uvi <= 7) {
    return "bg-warning";
  } else {
    return "bg-danger";
  }
};

let updateForecast = function (forecast) {
  console.log(forecast);
  let forecastGroup = document.getElementById("forecast");

  for (let i = 0; i < 5; i++) {
    let current = forecast[i + 1];
    let date = new Date(current.dt * 1000).toLocaleDateString("en-US");
    let iconUrl = `http://openweathermap.org/img/w/${current.weather[0].icon}.png`;
    let { temp, humidity } = current;

    forecastGroup.children[i].getElementsByClassName(
      "forecastDate"
    )[0].textContent = date;
    forecastGroup.children[i].getElementsByClassName("forecastIcon")[0].src =
      iconUrl;
    forecastGroup.children[i].getElementsByClassName(
      "forecastTemp"
    )[0].innerHTML = `${temp.day}&#176;F`;
    forecastGroup.children[i].getElementsByClassName(
      "forecastHumidity"
    )[0].textContent = `${humidity}%`;
  }
};

let createSavedSearch = function (city, restore = false) {
  if (!restore) savedSearches.unshift(city);

  let savedSearchElement = document.createElement("a");
  savedSearchElement.href = "#";
  savedSearchElement.className = "list-group-item list-group-item-action";
  savedSearchElement.textContent = city;

  let savedSearchesList = document.getElementById("savedSearches");
  savedSearchesList.insertBefore(
    savedSearchElement,
    savedSearchesList.firstChild
  );

  savedSearchElement.addEventListener("click", function (event) {
    event.preventDefault();
    search(city);
    for (let i = 0; i < savedSearchesList.childNodes.length; i++) {
      let childNode = savedSearchesList.childNodes[i];
      if (childNode === savedSearchElement) {
        savedSearchesList.removeChild(savedSearchElement);
        savedSearchesList.insertBefore(
          savedSearchElement,
          savedSearchesList.firstChild
        );
        savedSearches.splice(i, 1);
        savedSearches.unshift(city);
        localStorage.setItem("pastSearches", JSON.stringify(savedSearches));
        break;
      }
    }
  });

  if (savedSearches.length > 10) {
    savedSearches.pop();
    savedSearchesList.removeChild(savedSearchesList.lastChild);
  }

  if (!restore)
    localStorage.setItem("pastSearches", JSON.stringify(savedSearches));
};

/* SEARCH HANDLERS */
let setupSearchHandler = function () {
  let searchInput = document.getElementById("search");

  let searchAction = function () {
    let city = searchInput.value;
    search(city);
    createSavedSearch(city);
    searchInput.value = "";
  };

  searchInput.addEventListener("keyup", ({ key }) => {
    if (key === "Enter") {
      searchAction();
    }
  });

  let searchBtn = document.getElementById("searchBtn");
  searchBtn.addEventListener("click", event => {
    event.preventDefault();
    searchAction();
  });
};

let search = function (city) {
  getForecast(city, data => {
    updateCurrent(city, data.current);
    updateForecast(data.daily);
  });
};

/* SET UP UI */
setupSearchHandler();
restoreSavedSearches(savedSearches);
