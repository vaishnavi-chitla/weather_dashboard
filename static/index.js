BASE_URL_FAPI = "https://weather-dashboard-3-lo3p.onrender.com"
//BASE_URL_FAPI = "http://127.0.0.1:8000";

function formatLocalTime(timestamp, timezoneOffset) {
  let utcDate = new Date((timestamp + timezoneOffset) * 1000);
  return utcDate.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// Format local date in the city
function formatLocalDate(timestamp, timezoneOffset, options = {}) {
  let utcDate = new Date((timestamp + timezoneOffset) * 1000);
  return utcDate.toLocaleDateString("en-US", {
    timeZone: "UTC",
    ...options
  });
}
function getLocalNoonForecasts(forecastList, timezoneOffset) {
  let localForecasts = forecastList.map(item => {
    let localDate = new Date((item.dt + timezoneOffset) * 1000);
    return { ...item, localDate };
  });
  let grouped = {};
  localForecasts.forEach(item => {
    let key = item.localDate.getFullYear() + "-" +
              (item.localDate.getMonth() + 1) + "-" +
              item.localDate.getDate();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });
  let sortedDays = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  let dailyNoonForecasts = [];
  for (let day of sortedDays) {
    let dayList = grouped[day];
    let targetHour = 12;
    let best = dayList.reduce((a, b) => {
      return Math.abs(b.localDate.getHours() - targetHour) <
             Math.abs(a.localDate.getHours() - targetHour) ? b : a;
    }, dayList[0]);
    dailyNoonForecasts.push(best);
    if (dailyNoonForecasts.length === 5) break;
  }
  return dailyNoonForecasts;
}

async function getWeather() {
  console.log("getweather function is called ")
  if (!navigator.onLine) {
  console.log("The user is offline.");
  document.getElementById("loader").style.display = "none";
  document.getElementById("loader").style.display = "none";
  document.getElementById("searchbar").style.display = "flex";
  document.getElementById("error_msg").style.display = "flex";
  document.getElementById("error_msg").innerText = "Connection Failed !";
 }else{
  const city = document.getElementsByClassName("inputfeild")[0].value;
  if (!city) return alert("Please enter a city!");
  document.getElementById("mainContentParentDiv").style.display = "none"; 
  document.getElementById("loader").style.display = "block";
  document.getElementById("error_msg").style.display = "none";

  const url1 = `${BASE_URL_FAPI}/weather_current/${city}`;
  console.log("posting to:", url1)
  try {
    let response = await fetch(url1);
    if (!response.ok) {
      if(response.status >= 400 && response.status < 500){
      document.getElementById("loader").style.display = "none";
      document.getElementById("searchbar").style.display = "flex";
      document.getElementById("error_msg").style.display = "flex";
      document.getElementById("error_msg").innerText = "City not found!";
      }
    return;
    }
    let data = await response.json();
    console.log("Json:",data)
    setTimeout(async () => {
      document.getElementById("loader").style.display = "none";
      document.getElementById("mainContentParentDiv").style.display = "flex"; 
      document.getElementById("error_msg").style.display = "none";

      let lat = data.coord.lat;
      let lon = data.coord.lon;
      let response_city_name = data.name;
      let response_country_name = data.sys.country;
      let response_temp = data.main.temp;
      let response_sky_desc = data.weather[0].description;
      let iconCode = data.weather[0].icon;
      let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      let timezoneOffset = data.timezone; 

      let sunrise = formatLocalTime(data.sys.sunrise, timezoneOffset);
      let sunset = formatLocalTime(data.sys.sunset, timezoneOffset);

      let now = Math.floor(Date.now() / 1000);
      let todayDate = formatLocalDate(now, timezoneOffset, { month: "short", day: "2-digit", year: "numeric" });
      let todayTime = formatLocalTime(now, timezoneOffset);

      document.getElementById("weatherIcon").src = iconUrl; 
      document.getElementById("cityName").innerHTML = `${response_city_name}, ${response_country_name} `;
      document.getElementById("cityTemp").innerHTML = `${response_temp} &deg; C`;
      document.getElementById("cityDescription").innerText = response_sky_desc;
      document.getElementById("sunrise_time").innerText = sunrise;
      document.getElementById("sunset_time").innerText = sunset;
      document.getElementById("tdate").innerText = todayDate;
      document.getElementById("ttime").innerText = todayTime;

      // Forecast data
      let url2 = `${BASE_URL_FAPI}/weather_forecast/${lon}/${lat}`;
      console.log("posting to:", url2)
      let forecast_response = await fetch(url2);
      let forecast_data = await forecast_response.json();
      console.log("forecast JSON:", forecast_data)

      let dailyNoonForecasts = getLocalNoonForecasts(forecast_data.list, timezoneOffset);
      for (let i = 1; i <= 4; i++) {
        let forecast = dailyNoonForecasts[i];
        if (!forecast) continue; 
        let dateObj = forecast.localDate; 

        document.getElementById(`day_temp_${i}`).innerHTML = `${forecast.main.temp}&deg;C`;
        document.getElementById(`day_name_${i}`).innerText = dateObj.toLocaleDateString("en-US", { weekday: "long" });
        document.getElementById(`date_${i}`).innerText = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
        }).replace(",", "");

        let iconCode = forecast.weather[0].icon;
        let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        document.getElementById(`day_icon_${i}`).src = iconUrl;
        }
      // AQI data
      let url3 = `${BASE_URL_FAPI}/aqi_data/${lon}/${lat}`;
      let aqi_response = await fetch(url3);
      console.log("posting to:", url3)
      let aqi_data = await aqi_response.json();
      console.log("AQI response JSON:", aqi_data)
      let aqiIndex = aqi_data.list[0].main.aqi;
      function getAQIText(aqiIndex) {
        if (aqiIndex === 1) return "Good";
        if (aqiIndex === 2) return "Fair";
        if (aqiIndex === 3) return "Moderate";
        if (aqiIndex === 4) return "Poor";
        if (aqiIndex === 5) return "Very Poor";
        return "Unknown";
      }

      document.getElementById("AQI_heading").innerHTML = ` Air Quality Index (AQI) : ${aqiIndex} `;
      document.getElementById("AQI_desc").innerHTML = getAQIText(aqiIndex);

    }, 1000);

  } catch (err) {
    document.getElementById("loader").style.display = "none"
    document.getElementById("error_msg").style.display = "flex";
    document.getElementById("error_msg").innerText = "server error..";
    console.error("Error fetching weather:", err);
  }
}
}