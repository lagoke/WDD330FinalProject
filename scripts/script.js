// Get DOM elements
const cityInput = document.querySelector("#city-input"); // The input field where the user types the city name
const searchButton = document.querySelector("#search-btn"); // The search button to trigger the weather lookup
const currentWeatherDiv = document.querySelector(".current-weather"); // The div where the current weather information will be displayed
const daysForecastDiv = document.querySelector(".days-forecast"); // The div where the five days forecast information will be displayed

const API_KEY = "a4ec3dcfe31a9d7c2854c6b5a47718a2"; // API key from OpenWeatherMap

// This function generates the HTML card that displays weather information
const createWeatherCard = (cityName, weatherItem, index) => {
    // The information for the first day (current weather) is displayed in a different format
    if(index === 0) {
        return `
            <div class="mt-3 d-flex justify-content-between">
                <div>
                    <h3 class="fw-bold">${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h3> <!-- City name and date -->
                    <h6 class="my-3 mt-3">Temperature: ${((weatherItem.main.temp - 273.15) * 9/5 + 32).toFixed(2)}°F</h6> <!-- Temperature in Fahrenheit -->
                    <h6 class="my-3">Wind: ${weatherItem.wind.speed} M/S</h6> <!-- Wind speed in M/S -->
                    <h6 class="my-3">Humidity: ${weatherItem.main.humidity}%</h6> <!-- Humidity in % -->
                </div>
                <div class="text-center me-lg-5">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather icon"> <!-- Weather icon -->
                    <h6>${weatherItem.weather[0].description}</h6> <!-- Weather description -->
                </div>
            </div>`;
    } else {
        // The forecast for the rest of the days is displayed in a different format
        return `
            <div class="col mb-3">
                <div class="card border-0 bg-secondary text-white">
                    <div class="card-body p-3 text-white">
                        <h5 class="card-title fw-semibold">(${weatherItem.dt_txt.split(" ")[0]})</h5> <!-- Date -->
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather icon"> <!-- Weather icon -->
                        <h6 class="card-text my-3 mt-3">Temp: ${((weatherItem.main.temp - 273.15) * 9/5 + 32).toFixed(2)}°F</h6> <!-- Temperature in Fahrenheit -->
                        <h6 class="card-text my-3">Wind: ${weatherItem.wind.speed} M/S</h6> <!-- Wind speed in M/S -->
                        <h6 class="card-text my-3">Humidity: ${weatherItem.main.humidity}%</h6> <!-- Humidity in % -->
                    </div>
                </div>
            </div>`;
    }
}



// This function fetches the weather details for a specific location (latitude and longitude are passed as arguments)
const getWeatherDetails = (cityName, lat, lon) => {
    // Create the URL for the OpenWeatherMap API using the passed latitude and longitude
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    // Fetch the data from the OpenWeatherMap API
    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // The 'list' array from the fetched data contains the forecast data
        const forecastArray = data.list;

        // 'uniqueForecastDays' will be used to ensure we only keep forecast data from unique days
        const uniqueForecastDays = new Set();

        // Filter the 'forecastArray' to only keep the forecast data from 5 unique days
        const fiveDaysForecast = forecastArray.filter(forecast => {
            // Extract the day from the 'dt_txt' field of the forecast data
            const forecastDate = new Date(forecast.dt_txt).getDate();

            // If the day of the forecast is not already in 'uniqueForecastDays' and we don't already have 6 unique days,
            // add the day to 'uniqueForecastDays' and keep this forecast data
            if (!uniqueForecastDays.has(forecastDate) && uniqueForecastDays.size < 6) {
                uniqueForecastDays.add(forecastDate);
                return true;
            }
            // Otherwise, discard this forecast data
            return false;
        });

        // Clear the input field and the current weather and forecast displays
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        daysForecastDiv.innerHTML = "";

        // For each day's forecast data in 'fiveDaysForecast', generate the weather card HTML and add it to the page
        fiveDaysForecast.forEach((weatherItem, index) => {
            // Generate the weather card HTML
            const html = createWeatherCard(cityName, weatherItem, index);

            // If this is the first day's forecast data, add the weather card HTML to 'currentWeatherDiv'
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } 
            // Otherwise, add the weather card HTML to 'daysForecastDiv'
            else {
                daysForecastDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        // If there was an error fetching the weather data, alert the user
        alert("An error occurred while fetching the weather forecast!");
    });
}




// Function to fetch the latitude and longitude of the city entered by the user
const getCityCoordinates = () => {
    // Get the city name from the input field and trim any leading or trailing whitespace
    const cityName = cityInput.value.trim();
  
    // If no city name was entered, stop execution of the function
    if (cityName === "") return;

    // Create the URL for the OpenWeatherMap geocoding API
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  
    // Fetch the geocoding data from the OpenWeatherMap API
    fetch(API_URL).then(response => response.json()).then(data => {
        // If no geocoding data was found for the entered city name, alert the user and stop execution of the function
        if (!data.length) return alert(`No coordinates found for ${cityName}`);

        // Extract the latitude, longitude, and city name from the geocoding data
        const { lat, lon, name } = data[0];

        // Call the 'getWeatherDetails' function with the fetched latitude, longitude, and city name
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        // If there was an error fetching the geocoding data, alert the user
        alert("An error occurred while fetching the coordinates!");
    });
}

// Attach an event listener to the search button that calls the 'getCityCoordinates' function when the button is clicked
searchButton.addEventListener("click", () => getCityCoordinates());