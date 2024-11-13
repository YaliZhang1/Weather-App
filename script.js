const API_KEY = "8660c1ac02d2d6e3d6a1f57d6e3eb371";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const loadingIndicator = document.querySelector("#loading");

document.getElementById("get-weather").addEventListener("click", async () => {
  let inputBox = document.getElementById("city-input");
  let location = document.getElementById("city-input").value;
  loadingIndicator.classList.remove("hidden");
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
  // weatherContainer.appendChild(newWeatherInfoBox);
  weatherContainer.insertBefore(newWeatherInfoBox, inputBox);
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
  } finally {
    loadingIndicator.classList.add("hidden");
  }
}

function getWeatherData(data) {
  let weatherInfoBox = document.createElement("div");
  weatherInfoBox.className = "weather-info";

  if (data && data.main) {
    // get the location time
    const locationTime = new Date(data.dt * 1000); // dt是Unix时间戳
    const hours = locationTime.getUTCHours() + data.timezone / 3600; // 转换为当地小时
    const isDayTime = hours >= 6 && hours < 18; // 判断是否白天
    setBackground(data.weather[0].description, isDayTime); // 设置背景

    // 根据天气情况设置图标
    const weatherIcon = getWeatherIcon(data.weather[0].description);

    weatherInfoBox.innerHTML = `
      <div>
        <h2> ${data.name}, ${data.sys.country}</h2>
        <img src="${weatherIcon}" alt="Weather Icon" class="weather-icon" />
        <p> ${data.main.temp}°C</p>
        <p> ${data.weather[0].description}</p>
      </div>
      <div>
        <div>
          <p>Humidity </p>
          <p>${data.main.humidity}%</p>
        </div>
          <div> <p>Wind Speed </p><p>${data.wind.speed} m/s</div>
      </div>
`;
  } else {
    weatherInfoBox.innerHTML = "No weather data available";
  }
  return weatherInfoBox; //must return!
}

//创建一个 setBackground 函数，该函数根据天气描述和时间设置背景
function setBackground(weatherDescription, isDayTime) {
  const body = document.body;
  if (
    weatherDescription.includes("clear") ||
    weatherDescription.includes("sunny")
  ) {
    body.style.backgroundImage = "url('./asset/img/sunny3.jpg')";
  } else if (
    weatherDescription.includes("rain") ||
    weatherDescription.includes("drizzle")
  ) {
    body.style.backgroundImage = isDayTime
      ? "url('asset/img/day-rain1.jpg')"
      : "url('asset/img/night-rain.jpg')";
  } else if (weatherDescription.includes("cloud")) {
    body.style.backgroundImage = isDayTime
      ? "url('asset/img/day-cloudy1.jpg')"
      : "url('asset/img/night-cloudy1.jpg')";
  } else if (weatherDescription.includes("snow")) {
    body.style.backgroundImage = isDayTime
      ? "url('asset/img/day-snow.jpg')"
      : "url('asset/img/night-snow.jpg')";
  } else {
    body.style.backgroundImage = "url('asset/img/defult.jpg')";
  }
  // 设置背景样式
  body.style.backgroundSize = "cover";
  body.style.backgroundPosition = "center";
}

// 根据天气描述返回相应的图标路径
function getWeatherIcon(description) {
  if (description.includes("clear") || description.includes("sunny")) {
    return "asset/icon/sunny.png";
  } else if (description.includes("rain") || description.includes("drizzle")) {
    return "asset/icon/rainy.png";
  } else if (description.includes("cloud")) {
    return "asset/icon/cloudy.png";
  } else if (description.includes("snow")) {
    return "asset/icon/snowy.png";
  } else {
    return "asset/icon/cloudy.png"; // 默认图标路径
  }
}

const historyList = document.getElementById("history-list");

//检查是否有相同名字的城市
function isCityRenderedInHistory(data) {
  const cities = [...historyList.children];
  const sameCity = cities.find((city) => data.name === city.dataset.city);
  return sameCity ? true : false;
}
function saveToHistory(data) {
  // 检查是否已有该城市记录

  const isRendered = isCityRenderedInHistory(data);
  if (isRendered) {
    return;
  }

  // 确保 data 和其属性存在
  if (!data || !data.sys || !data.sys.country) {
    console.error("Invalid data object:", data);
    return; // 如果数据无效，则退出函数
  }
  const historyCard = document.createElement("div");
  historyCard.className = "history-card";

  historyCard.setAttribute("data-city", data.name);
  historyCard.setAttribute("data-country", data.sys.country);

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
