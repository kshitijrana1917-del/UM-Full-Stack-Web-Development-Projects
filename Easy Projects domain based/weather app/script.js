// Replace with your OpenWeatherMap API key
const API_KEY = "b959079196f91c8b16ace46f6c7dca48"; // example: "7f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5"

const els = {
  cityInput: document.getElementById("cityInput"),
  searchBtn: document.getElementById("searchBtn"),
  geoBtn: document.getElementById("geoBtn"),
  toggleUnit: document.getElementById("toggleUnit"),
  weather: document.getElementById("weather"),
  placeholder: document.getElementById("placeholder"),
  icon: document.getElementById("icon"),
  iconWrap: document.getElementById("iconWrap"),
  temp: document.getElementById("temp"),
  desc: document.getElementById("desc"),
  place: document.getElementById("place"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  feels: document.getElementById("feels"),
  updatedAt: document.getElementById("updatedAt"),
  error: document.getElementById("error"),
  forecast: document.getElementById("forecast"),
  airQuality: document.querySelector("#airQuality + p span"), // Selector fix
  favorites: document.getElementById("favorites"),
  favoriteCities: document.querySelector(".favorite-cities"),
  addFavorite: document.getElementById("addFavorite"),
  refreshData: document.getElementById("refreshData"),
  secondaryControls: document.querySelector(".secondary-controls"),

  // Navigation and View Elements (NEW)
  navBtns: document.querySelectorAll(".nav-btn"),
  appViews: document.querySelectorAll(".app-view"),
  mapLayerSelect: document.getElementById("mapLayerSelect"),
  historyPeriod: document.getElementById("historyPeriod"),
  historyDataType: document.getElementById("historyDataType"),
  alertsToggle: document.getElementById("alertsToggle"),
  alertsList: document.getElementById("alertsList"),

  // Profile Elements (NEW)
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  showLogin: document.getElementById("showLogin"),
  showRegister: document.getElementById("showRegister"),
  userSettings: document.getElementById("userSettings"),
  loginBtn: document.getElementById("loginBtn"),
  registerBtn: document.getElementById("registerBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  userName: document.getElementById("userName"),
  userEmailDisplay: document.getElementById("userEmailDisplay"),
};

let unit = "metric";
let lastData = null;
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// Weather condition backgrounds
const weatherBackgrounds = {
  'Thunderstorm': 'thunder',
  'Drizzle': 'rain',
  'Rain': 'rain',
  'Snow': 'snow',
  'Mist': 'mist',
  'Smoke': 'mist',
  'Haze': 'mist',
  'Dust': 'mist',
  'Fog': 'mist',
  'Sand': 'mist',
  'Ash': 'mist',
  'Squall': 'mist',
  'Tornado': 'thunder',
  'Clear': 'clear',
  'Clouds': 'clouds'
};

// --- CORE WEATHER LOGIC ---

function fetchWeather(url) {
  els.placeholder.style.display = "none";
  els.weather.style.display = "none";
  els.error.style.display = "none";
  els.iconWrap.classList.add('loading');

  fetch(url)
    .then(handleErrors)
    .then(data => {
      lastData = data;
      renderWeather(data);
      getForecast(data.coord.lat, data.coord.lon);
      getAirQuality(data.coord.lat, data.coord.lon);
    })
    .catch(error => {
      els.iconWrap.classList.remove('loading');
      els.weather.style.display = "none";
      els.error.style.display = "block";
      els.errorMessage.textContent = error.message;
      lastData = null;
    });
}

function handleErrors(response) {
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("City not found. Please check your spelling.");
    }
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

function fetchByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  fetchWeather(url);
}

function fetchByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  fetchWeather(url);
}

function renderWeather(data) {
  els.iconWrap.classList.remove('loading');
  els.weather.style.display = "block";

  const mainWeather = data.weather[0].main;
  const weatherId = data.weather[0].id;
  const unitSymbol = unit === "metric" ? "°C" : "°F";

  // Temperature Conversion
  let displayTemp = data.main.temp;
  let displayFeels = data.main.feels_like;

  if (unit === "imperial") {
    // Convert from Kelvin (OpenWeatherMap standard unit when units=metric is not used)
    // Since we used units=metric in fetch, we convert from Celsius to Fahrenheit
    displayTemp = (displayTemp * 9 / 5) + 32;
    displayFeels = (displayFeels * 9 / 5) + 32;
  }

  // Wind Speed Conversion (FIXED)
  const windSpeed_ms = data.wind?.speed;
  let displayWind = windSpeed_ms;
  let windUnit = "m/s";

  if (unit === "imperial" && windSpeed_ms) {
    // Convert m/s to mph (m/s * 2.237)
    displayWind = windSpeed_ms * 2.237;
    windUnit = "mph";
  }

  // Set background based on weather condition
  const backgroundClass = weatherBackgrounds[mainWeather] || 'default';
  document.body.className = `bg-${backgroundClass}`;

  // Update DOM elements
  els.icon.style.backgroundImage = `url('icons/${data.weather[0].icon}.svg')`;
  els.temp.textContent = Math.round(displayTemp) + unitSymbol;
  els.feels.textContent = Math.round(displayFeels) + unitSymbol;
  els.humidity.textContent = (data.main.humidity ?? "--") + " %";
  els.wind.textContent = displayWind ? `${displayWind.toFixed(1)} ${windUnit}` : "--";
  els.desc.textContent = data.weather[0].description.replace(/\b\w/g, l => l.toUpperCase());
  els.place.textContent = `${data.name}, ${data.sys.country}`;
  els.updatedAt.textContent = `Updated: ${new Date().toLocaleTimeString()}`;

  // Update Unit Toggle Button
  els.toggleUnit.textContent = unit === "metric" ? "°C" : "°F";
}

function getForecast(lat, lon) {
  // Use a different OpenWeatherMap endpoint for 5-day forecast
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  fetch(forecastUrl)
    .then(res => res.json())
    .then(data => {
      renderForecast(data);
    })
    .catch(err => console.error("Forecast error:", err));
}

function renderForecast(data) {
  els.forecast.innerHTML = ''; // Clear previous forecast

  // Filter for one entry per day (e.g., around 12:00 PM)
  const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyForecasts.forEach(item => {
    let displayTemp = item.main.temp;
    const unitSymbol = unit === "metric" ? "°C" : "°F";

    if (unit === "imperial") {
      displayTemp = (displayTemp * 9 / 5) + 32;
    }

    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    forecastItem.innerHTML = `
      <div class="day">${new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</div>
      <img src="icons/${item.weather[0].icon}.svg" alt="${item.weather[0].description}">
      <div class="temp">${Math.round(displayTemp)}${unitSymbol}</div>
      <div class="desc">${item.weather[0].main}</div>
    `;
    els.forecast.appendChild(forecastItem);
  });
}

function getAirQuality(lat, lon) {
  // Use the OpenWeatherMap Air Pollution API
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.list && data.list.length > 0) {
        const aqi = data.list[0].main.aqi; // AQI is 1 (Good) to 5 (Very Poor)
        const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

        // Update the span element inside the air quality detail (FIXED)
        els.airQuality.textContent = aqiLabels[aqi - 1] || 'N/A';
        
        // Optional: Change color based on AQI
        els.airQuality.style.color = aqi <= 2 ? 'lightgreen' : (aqi <= 4 ? 'orange' : 'red');
      }
    })
    .catch(err => console.error('Air quality error:', err));
}

function toggleUnit() {
  unit = unit === "metric" ? "imperial" : "metric";
  els.toggleUnit.textContent = unit === "metric" ? "°C" : "°F";
  
  // Re-fetch data to ensure all values (current and forecast) are updated in the new unit
  if (lastData && lastData.coord) {
    fetchByCoords(lastData.coord.lat, lastData.coord.lon);
  }
}

function addToFavorites() {
  if (!lastData || !lastData.name) return;
  
  const city = {
    name: lastData.name,
    country: lastData.sys.country,
    id: lastData.id
  };
  
  // Check if already in favorites
  if (!favorites.some(fav => fav.id === city.id)) {
    favorites.push(city);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    renderFavorites();
  }
}

function renderFavorites() {
  els.favoriteCities.innerHTML = '';
  
  if (favorites.length === 0) {
    els.favorites.style.display = 'none';
    return;
  }
  
  favorites.forEach(city => {
    const favCity = document.createElement('div');
    favCity.className = 'favorite-city';
    favCity.textContent = `${city.name}, ${city.country}`;
    favCity.addEventListener('click', () => {
        // Switch back to weather view before fetching
        switchView('weather'); 
        fetchByCity(city.name);
    });
    
    els.favoriteCities.appendChild(favCity);
  });
  
  els.favorites.style.display = 'block';
}


// --- VIEW SWITCHING AND ADVANCED VIEW IMPLEMENTATIONS ---

let historyChartInstance = null;
let weatherMap = null;
let currentLayer = null;

function switchView(viewName) {
  els.appViews.forEach(view => {
    view.classList.remove('active');
    if (view.id === `view-${viewName}`) {
      view.classList.add('active');
    }
  });
  
  els.navBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });

  // Special initialization for certain views
  if (viewName === 'maps') {
    // Initialize map if not done yet
    if (!window.weatherMap) initMap(); 
  } else if (viewName === 'history') {
    renderHistoryChart();
  } else if (viewName === 'alerts') {
    fetchWeatherAlerts();
  } else if (viewName === 'profile') {
    updateProfileView();
  }
}


// --- Maps View Logic ---

function initMap() {
  const defaultCoords = lastData ? [lastData.coord.lat, lastData.coord.lon] : [40, -100];
  
  // Initialize Leaflet Map
  weatherMap = L.map('weatherMap').setView(defaultCoords, 5);

  // Add base map layer (standard OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(weatherMap);

  // Set the default weather layer
  changeMapLayer();
  
  // Store map instance globally
  window.weatherMap = weatherMap; 
}

function changeMapLayer() {
  if (!weatherMap) return;

  const layerType = els.mapLayerSelect.value;
  // NOTE: OpenWeatherMap requires a different API key or subscription for map tiles.
  // Using the standard API_KEY for a mock demonstration.
  const tileLayerEndpoint = `https://tile.openweathermap.org/map/${layerType}_new/{z}/{x}/{y}.png?appid=${API_KEY}`;

  // Remove existing layer
  if (currentLayer) {
    weatherMap.removeLayer(currentLayer);
  }

  // Add the new weather layer
  currentLayer = L.tileLayer(tileLayerEndpoint, {
    maxZoom: 18,
    opacity: 0.6 // Make it slightly transparent
  }).addTo(weatherMap);
}


// --- History View Logic ---

function getMockHistoricalData(period, dataType) {
  const labels = [];
  const data = [];
  const days = parseInt(period);
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Generate some mock data based on the dataType
    let base = dataType === 'temp' ? (unit === 'metric' ? 20 : 68) : (dataType === 'humidity' ? 70 : 10);
    let fluctuation = Math.floor(Math.random() * 5) * (i % 2 === 0 ? 1 : -1);
    data.push((base + fluctuation).toFixed(1));
  }

  return { labels, data, dataType };
}

function renderHistoryChart() {
  const period = els.historyPeriod.value;
  const dataType = els.historyDataType.value;
  const mockData = getMockHistoricalData(period, dataType);
  const unitLabel = dataType === 'temp' ? (unit === 'metric' ? '°C' : '°F') : (dataType === 'humidity' ? '%' : (unit === 'metric' ? 'm/s' : 'mph'));
  
  const ctx = document.getElementById('historyChart').getContext('2d');
  
  if (historyChartInstance) {
    historyChartInstance.destroy(); // Destroy previous instance
  }
  
  historyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: mockData.labels,
      datasets: [{
        label: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} History`,
        data: mockData.data,
        borderColor: 'rgba(255, 255, 255, 0.7)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        tension: 0.4,
        fill: true,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: 'white', callback: (value) => value + unitLabel }
        },
        x: {
          grid: { display: false },
          ticks: { color: 'white' }
        }
      },
      plugins: {
        legend: { labels: { color: 'white' } },
        tooltip: { callbacks: { label: (context) => context.dataset.label + ': ' + context.parsed.y + unitLabel } }
      }
    }
  });
}


// --- Alerts View Logic ---

function fetchWeatherAlerts() {
  els.alertsList.innerHTML = '<p id="placeholder">Checking for weather alerts...</p>';
  
  // Mock Alert Data (Real implementation requires an API call, e.g., OpenWeatherMap One Call)
  const mockAlerts = [
    { title: "Severe Thunderstorm Warning", time: "Issued 1 hour ago", severity: "severe", text: "Expect hail and damaging winds until 10 PM local time." },
    { title: "Air Quality Advisory", time: "Valid until tomorrow", severity: "moderate", text: "Sensitive groups should limit time spent outdoors." },
    { title: "Dense Fog Statement", time: "Issued 30 minutes ago", severity: "minor", text: "Visibility reduced to under a quarter mile." }
  ];
  
  setTimeout(() => {
    if (!els.alertsToggle.checked) {
      els.alertsList.innerHTML = '<p id="placeholder">Weather alerts are disabled in settings.</p>';
      return;
    }
    
    if (lastData && lastData.coord) {
      renderAlerts(mockAlerts);
    } else {
      els.alertsList.innerHTML = '<p id="placeholder">Search for a location first to check for alerts.</p>';
    }
  }, 1000);
}

function renderAlerts(alerts) {
  els.alertsList.innerHTML = '';
  if (alerts.length === 0) {
    els.alertsList.innerHTML = '<p id="placeholder">No active weather alerts at this time.</p>';
    return;
  }
  
  alerts.forEach(alert => {
    const alertItem = document.createElement('div');
    alertItem.className = `alert-item ${alert.severity}`;
    alertItem.innerHTML = `
      <div class="alert-title">${alert.title}</div>
      <div class="alert-time">${alert.time}</div>
      <p>${alert.text}</p>
    `;
    els.alertsList.appendChild(alertItem);
  });
}


// --- Profile View Logic ---

let user = null; // Simulate user state

function updateProfileView() {
  if (user) {
    els.loginForm.style.display = 'none';
    els.registerForm.style.display = 'none';
    els.userSettings.style.display = 'block';
    els.userName.textContent = user.name || 'Weather User';
    els.userEmailDisplay.textContent = user.email;
  } else {
    els.loginForm.style.display = 'block';
    els.registerForm.style.display = 'none';
    els.userSettings.style.display = 'none';
  }
}

// Event listeners for profile form switching
els.showRegister.addEventListener('click', (e) => {
  e.preventDefault();
  els.loginForm.style.display = 'none';
  els.registerForm.style.display = 'block';
});

els.showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  els.registerForm.style.display = 'none';
  els.loginForm.style.display = 'block';
});

// Mock Authentication Logic
els.loginBtn.addEventListener('click', () => {
  const email = document.getElementById("userEmail").value;
  if (email) {
    user = { name: "Guest User", email: email };
    alert('Logged in successfully (Mock)');
    updateProfileView();
  } else {
    alert('Please enter an email.');
  }
});

els.registerBtn.addEventListener('click', () => {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  if (name && email) {
    user = { name: name, email: email };
    alert('Account created and logged in (Mock)');
    updateProfileView();
  } else {
    alert('Please enter your name and email.');
  }
});

els.logoutBtn.addEventListener('click', () => {
  user = null;
  alert('Logged out (Mock)');
  updateProfileView();
});


// --- EVENT LISTENERS ---

// Search
els.searchBtn.addEventListener("click", () => fetchByCity(els.cityInput.value));
els.cityInput.addEventListener("keydown", (e) => {
  if (e.key === 'Enter') fetchByCity(els.cityInput.value);
});

// Geolocation
els.geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => fetchByCoords(position.coords.latitude, position.coords.longitude),
      (error) => alert(`Error getting location: ${error.message}`)
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// Unit Toggle & Refresh
els.toggleUnit.addEventListener('click', toggleUnit);
els.addFavorite.addEventListener('click', addToFavorites);
els.refreshData.addEventListener('click', () => {
  if (lastData && lastData.coord) {
    fetchByCoords(lastData.coord.lat, lastData.coord.lon);
  }
});

// Navigation
els.navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchView(btn.dataset.view);
  });
});

// Map Controls
els.mapLayerSelect.addEventListener('change', changeMapLayer);

// History Controls
els.historyPeriod.addEventListener('change', renderHistoryChart);
els.historyDataType.addEventListener('change', renderHistoryChart);

// Alerts Toggle
els.alertsToggle.addEventListener('change', fetchWeatherAlerts);


// --- INITIALIZATION ---

window.onload = () => {
  // Load favorites
  renderFavorites();
  
  // Try to get current location weather on load
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => fetchByCoords(position.coords.latitude, position.coords.longitude),
      (error) => console.log('Geolocation error on load:', error.message)
    );
  }
  
  // Initialize map and history instance for the first time
  updateProfileView();
};