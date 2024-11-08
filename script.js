const API_KEY = "8660c1ac02d2d6e3d6a1f57d6e3eb371";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

document.getElementById("get-weather").addEventListener("click", async () => {
  let location = document.getElementById("city-input").value;
  let data = await getWeatherByLocation(location);

  console.log(data);
  // 清空之前的天气信息
  const weatherContainer = document.querySelector(".container");
  const existingWeatherInfo = document.querySelector(".weather-info");
  if (existingWeatherInfo) {
    weatherContainer.removeChild(existingWeatherInfo);
  }

  // 获取新的天气信息框并附加到 DOM
  const newWeatherInfoBox = getWeatherData(data);
  weatherContainer.appendChild(newWeatherInfoBox);

  // 保存城市到历史记录
  saveToHistory(data);
});

async function getWeatherByLocation(location) {
  try {
    const response = await fetch(
      `${BASE_URL}?q=${location}&appid=${API_KEY}&units=metric`
    );

    // Check if the response is okay (status code 200)
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json(); //must be json, must return!
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
  }
}

function getWeatherData(data) {
  let weatherInfoBox = document.createElement("div");
  weatherInfoBox.className = "weather-info";

  if (data && data.main) {
    weatherInfoBox.innerHTML = `
      <h2>Weather in ${data.name}, ${data.sys.country}</h2>
      <p>Temperature: ${data.main.temp}°C</p>
      <p>Weather: ${data.weather[0].description}</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind Speed: ${data.wind.speed} m/s
`;
  } else {
    weatherInfoBox.innerHTML = "No weather data available";
  }
  return weatherInfoBox; //must return!
}

function saveToHistory(data) {
  const historyList = document.getElementById("history-list");

  // 检查是否已有该城市记录
  if (!localStorage.getItem(data.name)) {
    const historyCard = document.createElement("div");
    historyCard.className = "history-card";
    historyCard.innerHTML = `
            <h3>${data.name}, ${data.sys.country}</h3>
            <p>Temperature: ${Math.round(data.main.temp)}°C</p>
            <p>Weather: ${data.weather[0].description}</p>
            <button onclick="removeFromHistory('${data.name}')">Remove</button>
        `;

    historyList.appendChild(historyCard);
    // 保存到 localStorage
    localStorage.setItem(data.name, JSON.stringify(data));
  }
}
function removeFromHistory(cityName) {
  const historyList = document.getElementById("history-list");

  // 从 localStorage 中移除
  localStorage.removeItem(cityName);

  // 从 DOM 中移除
  const cards = historyList.getElementsByClassName("history-card");

  for (let card of cards) {
    if (card.querySelector("h3").innerText.includes(cityName)) {
      historyList.removeChild(card);
      break;
    }
  }
}

// 页面加载时显示历史记录
window.onload = function () {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const data = JSON.parse(localStorage.getItem(key));

    if (data) {
      saveToHistory(data); // 显示每个城市的天气信息
    }
  }
};
