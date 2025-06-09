"use strict";
    /* --------------------
       TAB FUNCTIONALITY
    ---------------------*/
    function openTab(evt, tabName) {
      const tabcontents = document.getElementsByClassName("tabcontent");
      for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].style.display = "none";
        tabcontents[i].classList.remove("active");
      }
      const tablinks = document.getElementsByClassName("tablinks");
      for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
      }
      document.getElementById(tabName).style.display = "block";
      document.getElementById(tabName).classList.add("active");
      evt.currentTarget.classList.add("active");
    }
    document.getElementById("defaultTab").click();
    
    /* --------------------
       SEARCH TAB FUNCTIONS
    ---------------------*/
    document.getElementById("locationForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const loc = document.getElementById("locationInput").value.trim();
      if (loc) getWeather(loc);
    });
    
    function getWeather(loc) {
      const weatherOutput = document.getElementById("weatherOutput");
      const forecastGrid = document.getElementById("forecastGrid");
      weatherOutput.innerHTML = "<p>Loading weather data... ⏳</p>";
      forecastGrid.innerHTML = "";
      const weatherUrl = "https://wttr.in/" + encodeURIComponent(loc) + "?format=j1";
      fetch(weatherUrl)
        .then(r => r.json())
        .then(data => {
          const current = data.current_condition[0];
          const nearestArea = data.nearest_area[0];
          weatherOutput.innerHTML = `
            <div class="weather-card">
              <h3>Current Weather in ${nearestArea.areaName[0].value}, ${nearestArea.country[0].value} 🌍</h3>
              <p>Temperature: ${current.temp_C}°C</p>
              <p>Feels Like: ${current.FeelsLikeC}°C</p>
              <p>Condition: ${current.weatherDesc[0].value} ${getEmoticon(current.weatherDesc[0].value)}</p>
              <p>Humidity: ${current.humidity}%</p>
              <p>Wind: ${current.windspeedKmph} km/h</p>
            </div>
          `;
          data.weather.forEach(day => {
            forecastGrid.innerHTML += `
              <div class="forecast-card">
                <p><strong>${day.date}</strong></p>
                <p>Min: ${day.mintempC}°C</p>
                <p>Max: ${day.maxtempC}°C</p>
                <p>${day.hourly[4].weatherDesc[0].value} ${getEmoticon(day.hourly[4].weatherDesc[0].value)}</p>
              </div>
            `;
          });
        })
        .catch(err => {
          console.error("Error fetching weather data:", err);
          weatherOutput.innerHTML = "<p>Error fetching weather data. Please try again. ❗</p>";
        });
    }
    
    function getEmoticon(desc) {
      const d = desc.toLowerCase();
      if (d.includes("sunny") || d.includes("clear")) return "☀️";
      if (d.includes("rain") || d.includes("drizzle")) return "🌧️";
      if (d.includes("cloud")) return "☁️";
      if (d.includes("snow")) return "❄️";
      if (d.includes("thunder")) return "⚡";
      return "";
    }
    
    /* --------------------
       DYNAMIC GLOBAL TOP LIST FUNCTIONS
       (Real-time aggregation using Open-Meteo Archive API)
    ---------------------*/
    
    // Predefined cities from all continents (combining all keys from continentCities)
    const continentCities = {
      "Asia": [
        { name: "Tokyo", lat: 35.6895, lon: 139.6917 },
        { name: "Delhi", lat: 28.7041, lon: 77.1025 },
        { name: "Beijing", lat: 39.9042, lon: 116.4074 },
        { name: "Bangkok", lat: 13.7563, lon: 100.5018 },
        { name: "Dubai", lat: 25.2048, lon: 55.2708 },
        { name: "Kuala Lumpur", lat: 3.1390, lon: 101.6869 },
        { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
        { name: "Seoul", lat: 37.5665, lon: 126.9780 },
        { name: "Singapore", lat: 1.3521, lon: 103.8198 },
        { name: "Istanbul", lat: 41.0082, lon: 28.9784 }
      ],
      "Europe": [
        { name: "London", lat: 51.5074, lon: -0.1278 },
        { name: "Paris", lat: 48.8566, lon: 2.3522 },
        { name: "Berlin", lat: 52.5200, lon: 13.4050 },
        { name: "Madrid", lat: 40.4168, lon: -3.7038 },
        { name: "Rome", lat: 41.9028, lon: 12.4964 },
        { name: "Moscow", lat: 55.7558, lon: 37.6173 },
        { name: "Vienna", lat: 48.2082, lon: 16.3738 },
        { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
        { name: "Prague", lat: 50.0755, lon: 14.4378 },
        { name: "Lisbon", lat: 38.7223, lon: -9.1393 }
      ],
      "North America": [
        { name: "New York", lat: 40.7128, lon: -74.0060 },
        { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
        { name: "Chicago", lat: 41.8781, lon: -87.6298 },
        { name: "Toronto", lat: 43.6532, lon: -79.3832 },
        { name: "Mexico City", lat: 19.4326, lon: -99.1332 },
        { name: "Houston", lat: 29.7604, lon: -95.3698 },
        { name: "Phoenix", lat: 33.4484, lon: -112.0740 },
        { name: "Philadelphia", lat: 39.9526, lon: -75.1652 },
        { name: "San Antonio", lat: 29.4241, lon: -98.4936 },
        { name: "San Diego", lat: 32.7157, lon: -117.1611 }
      ],
      "South America": [
        { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
        { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
        { name: "Lima", lat: -12.0464, lon: -77.0428 },
        { name: "Bogotá", lat: 4.7110, lon: -74.0721 },
        { name: "Santiago", lat: -33.4489, lon: -70.6693 },
        { name: "Caracas", lat: 10.4806, lon: -66.9036 },
        { name: "Quito", lat: -0.1807, lon: -78.4678 },
        { name: "Medellín", lat: 6.2442, lon: -75.5812 },
        { name: "Guayaquil", lat: -2.1894, lon: -79.8891 },
        { name: "Montevideo", lat: -34.9011, lon: -56.1645 }
      ],
      "Africa": [
        { name: "Cairo", lat: 30.0444, lon: 31.2357 },
        { name: "Lagos", lat: 6.5244, lon: 3.3792 },
        { name: "Johannesburg", lat: -26.2041, lon: 28.0473 },
        { name: "Nairobi", lat: -1.2921, lon: 36.8219 },
        { name: "Casablanca", lat: 33.5731, lon: -7.5898 },
        { name: "Khartoum", lat: 15.5007, lon: 32.5599 },
        { name: "Accra", lat: 5.6037, lon: -0.1870 },
        { name: "Addis Ababa", lat: 8.9806, lon: 38.7578 },
        { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
        { name: "Durban", lat: -29.8587, lon: 31.0218 }
      ],
      "Oceania": [
        { name: "Sydney", lat: -33.8688, lon: 151.2093 },
        { name: "Melbourne", lat: -37.8136, lon: 144.9631 },
        { name: "Auckland", lat: -36.8485, lon: 174.7633 },
        { name: "Wellington", lat: -41.2865, lon: 174.7762 },
        { name: "Brisbane", lat: -27.4698, lon: 153.0251 },
        { name: "Perth", lat: -31.9505, lon: 115.8605 },
        { name: "Adelaide", lat: -34.9285, lon: 138.6007 },
        { name: "Hobart", lat: -42.8821, lon: 147.3272 },
        { name: "Christchurch", lat: -43.5321, lon: 172.6362 },
        { name: "Queenstown", lat: -45.0312, lon: 168.6626 }
      ]
    };

    // Function to fetch a city's extreme temperatures using Open-Meteo Archive API.
    async function fetchCityExtreme(city, startDate, endDate) {
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min&timezone=UTC`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.daily && data.daily.temperature_2m_max && data.daily.temperature_2m_min) {
          const cityMax = Math.max(...data.daily.temperature_2m_max);
          const cityMin = Math.min(...data.daily.temperature_2m_min);
          return { name: city.name, max: cityMax, min: cityMin };
        }
      } catch (error) {
        console.error(`Error for ${city.name}:`, error);
      }
      return { name: city.name, max: null, min: null };
    }

    // GLOBAL TOP EXTREMES: Aggregate data across all cities.
    async function updateGlobalDynamic() {
      const year = document.getElementById("globalYearSelect").value;
      const container = document.getElementById("globalResultsContainer");
      if (!year) { container.innerHTML = "<p>Please select a year.</p>"; return; }
      container.innerHTML = "<p>Loading global extreme data... ⏳</p>";
      
      let allCities = [];
      for (const cont in continentCities)
        allCities = allCities.concat(continentCities[cont]);
      
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      const promises = allCities.map(city => fetchCityExtreme(city, startDate, endDate));
      const results = await Promise.all(promises);
      const valid = results.filter(r => typeof r.max === "number" && typeof r.min === "number");
      const sortedHottest = valid.slice().sort((a, b) => b.max - a.max).slice(0, 10);
      const sortedColdest = valid.slice().sort((a, b) => a.min - b.min).slice(0, 10);
      displayGlobalResults(year, sortedHottest, sortedColdest);
    }

    function displayGlobalResults(year, hottest, coldest) {
      const container = document.getElementById("globalResultsContainer");
      let hottestHtml = `<div class="result-box"><h3>Top 10 Hottest in the World (${year}) 🔥</h3><ul>`;
      hottest.forEach(item => { hottestHtml += `<li>${item.name} - ${item.max}°C</li>`; });
      hottestHtml += "</ul></div>";
      
      let coldestHtml = `<div class="result-box"><h3>Top 10 Coldest in the World (${year}) ❄️</h3><ul>`;
      coldest.forEach(item => { coldestHtml += `<li>${item.name} - ${item.min}°C</li>`; });
      coldestHtml += "</ul></div>";
      
      container.innerHTML = hottestHtml + coldestHtml;
    }

    // CONTINENTAL TOP EXTREMES: For a specific continent.
    async function updateContinentalDynamic() {
      const continent = document.getElementById("continentSelect").value;
      const year = document.getElementById("continentYearSelect").value;
      const container = document.getElementById("continentalResultsContainer");
      if (!continent || !year) { container.innerHTML = "<p>Please select both a continent and a year.</p>"; return; }
      container.innerHTML = "<p>Loading continental extreme data... ⏳</p>";
      
      const cities = continentCities[continent];
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      const promises = cities.map(city => fetchCityExtreme(city, startDate, endDate));
      const results = await Promise.all(promises);
      const valid = results.filter(r => typeof r.max === "number" && typeof r.min === "number");
      const sortedHottest = valid.slice().sort((a, b) => b.max - a.max).slice(0, 10);
      const sortedColdest = valid.slice().sort((a, b) => a.min - b.min).slice(0, 10);
      displayContinentalResults(continent, year, sortedHottest, sortedColdest);
    }

    function displayContinentalResults(continent, year, hottest, coldest) {
      const container = document.getElementById("continentalResultsContainer");
      let hottestHtml = `<div class="result-box"><h3>Top 10 Hottest in ${continent} (${year}) 🔥</h3><ul>`;
      hottest.forEach(item => { hottestHtml += `<li>${item.name} - ${item.max}°C</li>`; });
      hottestHtml += "</ul></div>";
      
      let coldestHtml = `<div class="result-box"><h3>Top 10 Coldest in ${continent} (${year}) ❄️</h3><ul>`;
      coldest.forEach(item => { coldestHtml += `<li>${item.name} - ${item.min}°C</li>`; });
      coldestHtml += "</ul></div>";
      
      container.innerHTML = hottestHtml + coldestHtml;
    }
