function WeatherApp() {
    this.apiKey = "62d7575df8433cafdcf7048fd6472260";

    this.cityInput = document.getElementById("city-input");
    this.searchBtn = document.getElementById("search-btn");
    this.weatherDisplay = document.getElementById("weather-display");

    this.recentContainer = document.getElementById("recent-searches");
    this.clearBtn = document.getElementById("clear-btn");

    this.recentSearches = [];
}

/* ================= INIT ================= */

WeatherApp.prototype.init = function() {
    this.loadRecentSearches();
    this.loadLastCity();

    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    });

    this.clearBtn.addEventListener("click", this.clearHistory.bind(this));
};

/* ================= SEARCH ================= */

WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();
    if (!city) return;

    this.getWeather(city);
    this.cityInput.value = "";
};

/* ================= WEATHER + FORECAST ================= */

WeatherApp.prototype.getWeather = async function(city) {

    try {
        this.showLoading();
        this.searchBtn.disabled = true;

        const weatherURL =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`;

        const forecastURL =
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric`;

        const [weatherRes, forecastRes] = await Promise.all([
            axios.get(weatherURL),
            axios.get(forecastURL)
        ]);

        this.displayWeather(weatherRes.data);

        const processed = this.processForecastData(forecastRes.data.list);
        this.displayForecast(processed);

        this.saveRecentSearch(weatherRes.data.name);

    } catch (error) {
        this.showError("City not found or API error.");
    } finally {
        this.searchBtn.disabled = false;
    }
};

/* ================= DISPLAY WEATHER ================= */

WeatherApp.prototype.displayWeather = function(data) {
    this.weatherDisplay.innerHTML = `
        <h2>${data.name}</h2>
        <p>🌡 ${data.main.temp}°C</p>
        <p>${data.weather[0].description}</p>
    `;
};

/* ================= FORECAST ================= */

WeatherApp.prototype.processForecastData = function(list) {
    const daily = list.filter(item => item.dt_txt.includes("12:00:00"));
    return daily.slice(0, 5);
};

WeatherApp.prototype.displayForecast = function(data) {
    let html = `<div class="forecast-container">`;

    data.forEach(day => {
        const date = new Date(day.dt_txt);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        html += `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
                <p>${day.main.temp}°C</p>
            </div>
        `;
    });

    html += `</div>`;
    this.weatherDisplay.innerHTML += html;
};

/* ================= LOCAL STORAGE ================= */

WeatherApp.prototype.loadRecentSearches = function() {
    const stored = localStorage.getItem("recentSearches");
    this.recentSearches = stored ? JSON.parse(stored) : [];
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function(city) {

    city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    this.recentSearches = this.recentSearches.filter(c => c !== city);

    this.recentSearches.unshift(city);

    if (this.recentSearches.length > 5) {
        this.recentSearches.pop();
    }

    localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));
    localStorage.setItem("lastCity", city);

    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function() {
    this.recentContainer.innerHTML = "";

    this.recentSearches.forEach(city => {
        const btn = document.createElement("button");
        btn.textContent = city;
        btn.addEventListener("click", () => {
            this.getWeather(city);
        });
        this.recentContainer.appendChild(btn);
    });
};

WeatherApp.prototype.loadLastCity = function() {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
        this.getWeather(lastCity);
    }
};

WeatherApp.prototype.clearHistory = function() {
    localStorage.removeItem("recentSearches");
    localStorage.removeItem("lastCity");
    this.recentSearches = [];
    this.displayRecentSearches();
};

/* ================= UI ================= */

WeatherApp.prototype.showLoading = function() {
    this.weatherDisplay.innerHTML = `<div class="spinner"></div>`;
};

WeatherApp.prototype.showError = function(message) {
    this.weatherDisplay.innerHTML = `<p class="error">${message}</p>`;
};

/* ================= START APP ================= */

const app = new WeatherApp();
app.init();