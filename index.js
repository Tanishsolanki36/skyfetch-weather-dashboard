function WeatherApp() {
    this.apiKey = "62d7575df8433cafdcf7048fd6472260";

    this.cityInput = document.getElementById("city-input");
    this.searchBtn = document.getElementById("search-btn");
    this.weatherDisplay = document.getElementById("weather-display");
}

/* ================= INIT ================= */

WeatherApp.prototype.init = function() {
    this.showWelcome();

    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    });
};

/* ================= SEARCH ================= */

WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name!");
        return;
    }

    this.getWeather(city);
    this.cityInput.value = "";
};

/* ================= WEATHER ================= */

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

    } catch (error) {
        this.showError("City not found or API error.");
    } finally {
        this.searchBtn.disabled = false;
    }
};

/* ================= DISPLAY CURRENT WEATHER ================= */

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

WeatherApp.prototype.displayForecast = function(forecastData) {

    let forecastHTML = `<div class="forecast-container">`;

    forecastData.forEach(day => {

        const date = new Date(day.dt_txt);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        forecastHTML += `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" />
                <p>${day.main.temp}°C</p>
                <p>${day.weather[0].description}</p>
            </div>
        `;
    });

    forecastHTML += `</div>`;

    this.weatherDisplay.innerHTML += forecastHTML;
};

/* ================= UI HELPERS ================= */

WeatherApp.prototype.showLoading = function() {
    this.weatherDisplay.innerHTML = `<div class="spinner"></div>`;
};

WeatherApp.prototype.showError = function(message) {
    this.weatherDisplay.innerHTML = `<p class="error">${message}</p>`;
};

WeatherApp.prototype.showWelcome = function() {
    this.weatherDisplay.innerHTML =
        `<p>Search for a city to see weather & 5-day forecast 🌍</p>`;
};

/* ================= CREATE INSTANCE ================= */

const app = new WeatherApp();
app.init();