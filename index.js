const apiKey = "62d7575df8433cafdcf7048fd6472260";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherDisplay = document.getElementById("weather-display");

// Show Loading Spinner
function showLoading() {
    weatherDisplay.innerHTML = `<div class="spinner"></div>`;
}

// Show Error Message
function showError(message) {
    weatherDisplay.innerHTML = `<p class="error">${message}</p>`;
}

// Get Weather Data
async function getWeather(city) {

    try {
        showLoading();
        searchBtn.disabled = true;

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        const data = response.data;

        weatherDisplay.innerHTML = `
            <h2>${data.name}</h2>
            <p>🌡 Temperature: ${data.main.temp} °C</p>
            <p>🌥 Condition: ${data.weather[0].description}</p>
            <p>💧 Humidity: ${data.main.humidity}%</p>
        `;

    } catch (error) {

        if (error.response && error.response.status === 404) {
            showError("City not found! Please enter a valid city.");
        } else {
            showError("Something went wrong. Try again later.");
        }

    } finally {
        searchBtn.disabled = false;
    }
}

// Search Button Click
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name!");
        return;
    }

    getWeather(city);
    cityInput.value = "";
});

// Enter Key Support
cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});